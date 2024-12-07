import { motion } from 'framer-motion';
import { useVirtualScroll } from '@/hooks/useScrollAnimation';

interface VirtualizedDropdownProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onSelect: (item: T) => void;
  itemHeight: number;
  maxHeight: number;
  className?: string;
}

export default function VirtualizedDropdown<T>({
  items,
  renderItem,
  onSelect,
  itemHeight,
  maxHeight,
  className = ''
}: VirtualizedDropdownProps<T>) {
  const { containerRef, visibleItems, totalHeight, offsetY } = useVirtualScroll(
    items,
    itemHeight,
    maxHeight
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scaleY: 0.5 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, y: -10, scaleY: 0.5 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden ${className}`}
      style={{ maxHeight }}
    >
      <div
        ref={containerRef}
        className="absolute top-0 left-0 w-full overflow-auto"
        style={{ height: maxHeight }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="cursor-pointer"
                style={{ height: itemHeight }}
                onClick={() => onSelect(item)}
                whileHover={{ 
                  scale: 1.02, 
                  backgroundColor: 'rgba(243, 244, 246, 1)',
                  transition: { duration: 0.2 }
                }}
              >
                {renderItem(item, index)}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        className="absolute right-2 top-1 bottom-1 w-1.5 rounded-full bg-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: items.length > 5 ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="absolute w-full rounded-full bg-gray-400"
          style={{
            height: `${(maxHeight / totalHeight) * 100}%`,
            top: `${(offsetY / totalHeight) * 100}%`
          }}
          whileHover={{ backgroundColor: 'rgb(156, 163, 175)' }}
        />
      </motion.div>
    </motion.div>
  );
}
