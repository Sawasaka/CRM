/* eslint-disable react/prop-types */

import * as React from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF]',
        'transition-colors duration-150 resize-none',
        'hover:border-[#D1D5DB]',
        'focus-visible:outline-none focus-visible:border-[#4F46E5] focus-visible:ring-2 focus-visible:ring-[#EEF2FF]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F9FAFB]',
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'

export { Textarea }
