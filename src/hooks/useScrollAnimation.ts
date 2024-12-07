import { useRef, useEffect } from 'react';
import { useInView } from 'framer-motion';

export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once: true,
    amount: threshold 
  });

  return { ref, isInView };
}

export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const startIndex = useRef(0);
  const visibleItems = useRef<T[]>([]);
  const scrollTop = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateVisibleItems = () => {
    if (!containerRef.current) return;

    scrollTop.current = containerRef.current.scrollTop;
    startIndex.current = Math.floor(scrollTop.current / itemHeight);
    const endIndex = Math.min(
      startIndex.current + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    visibleItems.current = items.slice(
      Math.max(0, startIndex.current - 5),
      endIndex + 5
    );
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateVisibleItems();
    
    const handleScroll = () => {
      requestAnimationFrame(updateVisibleItems);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [items, itemHeight]);

  return {
    containerRef,
    visibleItems: visibleItems.current,
    totalHeight: items.length * itemHeight,
    offsetY: Math.max(0, startIndex.current - 5) * itemHeight
  };
}
