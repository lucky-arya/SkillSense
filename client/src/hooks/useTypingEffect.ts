import { useState, useEffect, useRef } from 'react';

/**
 * Hook that simulates a typing animation for text content.
 * - Streams text word-by-word (faster than char-by-char, looks natural)
 * - Supports markdown content
 * - StrictMode-safe (no stale refs blocking re-runs)
 * - Returns { displayedText, isTyping }
 */
export function useTypingEffect(
  fullText: string,
  enabled = true,
  wordsPerTick = 3,
  intervalMs = 30,
) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const cancelledRef = useRef(false);

  useEffect(() => {
    // If disabled or empty, show full text immediately
    if (!enabled || !fullText) {
      setDisplayedText(fullText || '');
      setIsTyping(false);
      return;
    }

    // Split into word + whitespace tokens for natural word-by-word reveal
    const words = fullText.split(/(\s+)/);
    let currentIndex = 0;
    cancelledRef.current = false;

    setDisplayedText('');
    setIsTyping(true);

    const timer = setInterval(() => {
      if (cancelledRef.current) {
        clearInterval(timer);
        return;
      }
      currentIndex += wordsPerTick;
      if (currentIndex >= words.length) {
        setDisplayedText(fullText);
        setIsTyping(false);
        clearInterval(timer);
      } else {
        setDisplayedText(words.slice(0, currentIndex).join(''));
      }
    }, intervalMs);

    return () => {
      cancelledRef.current = true;
      clearInterval(timer);
      // On cleanup, immediately show full text so nothing is lost
      setDisplayedText(fullText);
      setIsTyping(false);
    };
  }, [fullText, enabled, wordsPerTick, intervalMs]);

  return { displayedText, isTyping };
}
