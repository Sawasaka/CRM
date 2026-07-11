import { Composition } from 'remotion'
import { CallAiDemo } from './CallAiDemo'
import { RealtimeSalesAssistDemo } from './RealtimeSalesAssistDemo'

export const RemotionRoot = () => (
  <>
    <Composition
      id="RealtimeSalesAssistDemo"
      component={RealtimeSalesAssistDemo}
      durationInFrames={300}
      fps={30}
      width={1280}
      height={720}
    />
    <Composition
      id="CallAiDemo"
      component={CallAiDemo}
      durationInFrames={1200}
      fps={30}
      width={1280}
      height={720}
    />
  </>
)
