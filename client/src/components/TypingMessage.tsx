import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTypingEffect } from '../hooks/useTypingEffect';

interface TypingMessageProps {
  content: string;
  /** Only animate the latest message */
  animate: boolean;
}

/**
 * Renders markdown text with a word-by-word typing animation.
 * Shows a blinking cursor while typing.
 */
function TypingMessageInner({ content, animate }: TypingMessageProps) {
  const { displayedText, isTyping } = useTypingEffect(content, animate, 3, 30);

  return (
    <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:text-gray-100 prose-strong:text-gray-100 prose-a:text-blue-400">
      <ReactMarkdown>{displayedText}</ReactMarkdown>
      {isTyping && (
        <span className="inline-block w-1.5 h-4 bg-blue-400 ml-0.5 animate-pulse rounded-sm align-text-bottom" />
      )}
    </div>
  );
}

export const TypingMessage = memo(TypingMessageInner);
