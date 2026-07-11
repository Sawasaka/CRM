import AVFoundation
import AppKit
import CoreVideo
import Foundation

struct RenderError: Error, CustomStringConvertible {
  let description: String
}

func require(_ condition: Bool, _ message: String) throws {
  if !condition {
    throw RenderError(description: message)
  }
}

func removeFileIfExists(_ url: URL) {
  if FileManager.default.fileExists(atPath: url.path) {
    try? FileManager.default.removeItem(at: url)
  }
}

func makePixelBuffer(from imageURL: URL, width: Int, height: Int) throws -> CVPixelBuffer {
  guard
    let image = NSImage(contentsOf: imageURL),
    let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil)
  else {
    throw RenderError(description: "Could not load image: \(imageURL.path)")
  }

  var pixelBuffer: CVPixelBuffer?
  let attrs: [String: Any] = [
    kCVPixelBufferCGImageCompatibilityKey as String: true,
    kCVPixelBufferCGBitmapContextCompatibilityKey as String: true,
  ]
  let status = CVPixelBufferCreate(
    kCFAllocatorDefault,
    width,
    height,
    kCVPixelFormatType_32BGRA,
    attrs as CFDictionary,
    &pixelBuffer
  )
  guard status == kCVReturnSuccess, let buffer = pixelBuffer else {
    throw RenderError(description: "Could not create pixel buffer.")
  }

  CVPixelBufferLockBaseAddress(buffer, [])
  defer { CVPixelBufferUnlockBaseAddress(buffer, []) }

  guard let context = CGContext(
    data: CVPixelBufferGetBaseAddress(buffer),
    width: width,
    height: height,
    bitsPerComponent: 8,
    bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
    space: CGColorSpaceCreateDeviceRGB(),
    bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue
  ) else {
    throw RenderError(description: "Could not create CGContext.")
  }

  context.setFillColor(CGColor(red: 0.03, green: 0.04, blue: 0.06, alpha: 1))
  context.fill(CGRect(x: 0, y: 0, width: width, height: height))
  context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))

  return buffer
}

func durationOfAudioFiles(_ urls: [URL]) -> CMTime {
  urls.reduce(.zero) { total, url in
    let asset = AVURLAsset(url: url)
    return total + asset.duration
  }
}

func renderSilentVideo(imageURL: URL, outputURL: URL, duration: CMTime, width: Int, height: Int) async throws {
  removeFileIfExists(outputURL)

  let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
  let videoSettings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [
      AVVideoAverageBitRateKey: 3_000_000,
      AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    ],
  ]
  let input = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
  input.expectsMediaDataInRealTime = false

  let adaptor = AVAssetWriterInputPixelBufferAdaptor(
    assetWriterInput: input,
    sourcePixelBufferAttributes: [
      kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
      kCVPixelBufferWidthKey as String: width,
      kCVPixelBufferHeightKey as String: height,
    ]
  )

  try require(writer.canAdd(input), "Could not add video input.")
  writer.add(input)

  let buffer = try makePixelBuffer(from: imageURL, width: width, height: height)
  let fps: Int32 = 30
  let frameCount = max(1, Int(ceil(CMTimeGetSeconds(duration) * Double(fps))))

  writer.startWriting()
  writer.startSession(atSourceTime: .zero)

  try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
    var frame = 0
    input.requestMediaDataWhenReady(on: DispatchQueue(label: "static-video-writer")) {
      while input.isReadyForMoreMediaData && frame < frameCount {
        let presentationTime = CMTime(value: CMTimeValue(frame), timescale: fps)
        if !adaptor.append(buffer, withPresentationTime: presentationTime) {
          continuation.resume(throwing: writer.error ?? RenderError(description: "Could not append frame."))
          return
        }
        frame += 1
      }

      if frame >= frameCount {
        input.markAsFinished()
        writer.finishWriting {
          if writer.status == .completed {
            continuation.resume()
          } else {
            continuation.resume(throwing: writer.error ?? RenderError(description: "Video writer failed."))
          }
        }
      }
    }
  }
}

func composeVideoAndAudio(videoURL: URL, audioURLs: [URL], outputURL: URL) async throws {
  removeFileIfExists(outputURL)

  let composition = AVMutableComposition()
  let videoAsset = AVURLAsset(url: videoURL)

  guard
    let sourceVideoTrack = videoAsset.tracks(withMediaType: .video).first,
    let compositionVideoTrack = composition.addMutableTrack(
      withMediaType: .video,
      preferredTrackID: kCMPersistentTrackID_Invalid
    )
  else {
    throw RenderError(description: "Could not prepare video track.")
  }

  try compositionVideoTrack.insertTimeRange(
    CMTimeRange(start: .zero, duration: videoAsset.duration),
    of: sourceVideoTrack,
    at: .zero
  )

  guard let compositionAudioTrack = composition.addMutableTrack(
    withMediaType: .audio,
    preferredTrackID: kCMPersistentTrackID_Invalid
  ) else {
    throw RenderError(description: "Could not prepare audio track.")
  }

  var cursor = CMTime.zero
  for audioURL in audioURLs {
    let asset = AVURLAsset(url: audioURL)
    if let sourceAudioTrack = asset.tracks(withMediaType: .audio).first {
      try compositionAudioTrack.insertTimeRange(
        CMTimeRange(start: .zero, duration: asset.duration),
        of: sourceAudioTrack,
        at: cursor
      )
      cursor = cursor + asset.duration
    }
  }

  guard let exporter = AVAssetExportSession(
    asset: composition,
    presetName: AVAssetExportPresetHighestQuality
  ) else {
    throw RenderError(description: "Could not create exporter.")
  }
  exporter.outputURL = outputURL
  exporter.outputFileType = .mp4
  exporter.shouldOptimizeForNetworkUse = true

  try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
    exporter.exportAsynchronously {
      switch exporter.status {
      case .completed:
        continuation.resume()
      case .failed, .cancelled:
        continuation.resume(throwing: exporter.error ?? RenderError(description: "Export failed."))
      default:
        continuation.resume(throwing: RenderError(description: "Unexpected export status: \(exporter.status.rawValue)"))
      }
    }
  }
}

@main
struct StaticAudioMP4 {
  static func main() async {
    do {
      let args = CommandLine.arguments
      try require(args.count >= 4, "Usage: generate-static-audio-mp4 <image.png> <output.mp4> <audio1.aiff> [audio2.aiff ...]")

      let imageURL = URL(fileURLWithPath: args[1])
      let outputURL = URL(fileURLWithPath: args[2])
      let audioURLs = args.dropFirst(3).map { URL(fileURLWithPath: $0) }
      let duration = durationOfAudioFiles(audioURLs)
      try require(CMTimeGetSeconds(duration) > 0, "Audio duration is zero.")

      let tempVideoURL = outputURL
        .deletingLastPathComponent()
        .appendingPathComponent(".\(outputURL.deletingPathExtension().lastPathComponent)-silent.mp4")

      try await renderSilentVideo(
        imageURL: imageURL,
        outputURL: tempVideoURL,
        duration: duration,
        width: 1280,
        height: 720
      )
      try await composeVideoAndAudio(videoURL: tempVideoURL, audioURLs: audioURLs, outputURL: outputURL)
      removeFileIfExists(tempVideoURL)
      print("Wrote \(outputURL.path)")
    } catch {
      fputs("Error: \(error)\n", stderr)
      exit(1)
    }
  }
}
