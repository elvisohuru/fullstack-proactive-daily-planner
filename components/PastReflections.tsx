import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const ReflectionItem: React.FC<{ reflection: any, onVisible: () => void }> = ({ reflection, onVisible }) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                onVisible();
                observer.disconnect();
            }
        }, { threshold: 0.1 });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [onVisible]);

    return (
        <div ref={ref} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-2">
            {format(parseISO(reflection.date), 'EEEE, MMMM d, yyyy')}
            </p>
            <div>
            <p className="text-xs font-medium text-calm-green-700 dark:text-calm-green-400">What went well:</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{reflection.well}</p>
            </div>
            <div className="mt-2">
            <p className="text-xs font-medium text-calm-blue-700 dark:text-calm-blue-400">To improve:</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{reflection.improve}</p>
            </div>
        </div>
    );
};


const PastReflections: React.FC = () => {
  const { reflections, fetchReflections } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset visible items when search term changes
    setVisibleItems(new Set());
    fetchReflections({ search: debouncedSearchTerm });
  }, [debouncedSearchTerm, fetchReflections]);
  
  const handleLoadMore = useCallback(() => {
    if (reflections.nextCursor) {
      fetchReflections({ cursor: reflections.nextCursor, search: debouncedSearchTerm });
    }
  }, [reflections.nextCursor, debouncedSearchTerm, fetchReflections]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        handleLoadMore();
      }
    }, { threshold: 1.0 });

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [handleLoadMore]);

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Reflection History</h3>
      <input
        type="text"
        placeholder="Search reflections..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-2 mb-4 text-sm"
      />
      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {reflections.data.length > 0 ? (
          reflections.data.map((r, index) => {
            const isVisible = visibleItems.has(r.date);
            return (
              <motion.div
                key={r.date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                style={{ minHeight: isVisible ? 'auto' : '130px' }} // Set a placeholder height
              >
                <ReflectionItem
                  reflection={r}
                  onVisible={() => setVisibleItems(prev => new Set(prev).add(r.date))}
                />
              </motion.div>
            )
          })
        ) : (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
            No matching reflections found.
          </p>
        )}
        <div ref={loaderRef} />
      </div>
    </div>
  );
};

export default PastReflections;