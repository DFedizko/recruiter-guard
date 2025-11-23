"use client"

interface HTMLContentProps {
  content: string
  className?: string
}

export function HTMLContent({ content, className }: HTMLContentProps) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

