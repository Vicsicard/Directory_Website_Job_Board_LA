'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { generateSlug } from '@/utils/csvParser';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedContainer from '@/components/common/AnimatedContainer';
import VirtualizedDropdown from '@/components/common/VirtualizedDropdown';

// Animation variants
const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 }
};

const fadeInScale = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
};

const slideInFromRight = {
  initial: { x: 20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 }
};

const bounceIn = {
  initial: { scale: 0.3, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.3, opacity: 0 }
};

const pulseAnimation = {
  initial: { scale: 1 },
  animate: { scale: 1.05 },
  exit: { scale: 1 }
};

interface Keyword {
  keyword: string;
}

interface Location {
  location: string;
  state: string;
}

interface ErrorState {
  keyword?: string;
  location?: string;
  general?: string;
}

export default function SearchBox() {
  const router = useRouter();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedKeyword, setSelectedKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showKeywordDropdown, setShowKeywordDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [filteredKeywords, setFilteredKeywords] = useState<Keyword[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [errors, setErrors] = useState<ErrorState>({});
  const [showError, setShowError] = useState(false);
  
  const keywordRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setErrors({});
      try {
        const [keywordsRes, locationsRes] = await Promise.all([
          fetch('/api/keywords'),
          fetch('/api/locations')
        ]);
        
        if (!keywordsRes.ok || !locationsRes.ok) {
          throw new Error('Failed to fetch search data');
        }
        
        const keywordsData = await keywordsRes.json();
        const locationsData = await locationsRes.json();
        
        setKeywords(keywordsData);
        setLocations(locationsData);
        setFilteredKeywords(keywordsData);
        setFilteredLocations(locationsData);
      } catch (error) {
        setErrors({ general: 'Failed to load search options. Please try again later.' });
        setShowError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setShowError(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  const validateInput = () => {
    const newErrors: ErrorState = {};
    
    if (!selectedKeyword) {
      newErrors.keyword = 'Please select a service';
    } else if (!keywords.find(k => k.keyword === selectedKeyword)) {
      newErrors.keyword = 'Please select a valid service from the list';
    }
    
    if (!selectedLocation) {
      newErrors.location = 'Please select a location';
    } else if (!locations.find(l => `${l.location}, ${l.state}` === selectedLocation)) {
      newErrors.location = 'Please select a valid location from the list';
    }
    
    setErrors(newErrors);
    setShowError(Object.keys(newErrors).length > 0);
    return Object.keys(newErrors).length === 0;
  };

  const handleKeywordChange = (value: string) => {
    if (!hasInteracted) setHasInteracted(true);
    setSelectedKeyword(value);
    setErrors(prev => ({ ...prev, keyword: undefined }));
    setFilteredKeywords(
      keywords.filter(k => 
        k.keyword.toLowerCase().includes(value.toLowerCase())
      )
    );
    setShowKeywordDropdown(true);
  };

  const handleLocationChange = (value: string) => {
    if (!hasInteracted) setHasInteracted(true);
    setSelectedLocation(value);
    setErrors(prev => ({ ...prev, location: undefined }));
    setFilteredLocations(
      locations.filter(l => 
        `${l.location}, ${l.state}`.toLowerCase().includes(value.toLowerCase())
      )
    );
    setShowLocationDropdown(true);
  };

  const handleSearch = async () => {
    if (!validateInput()) {
      const element = errors.keyword ? keywordRef.current : locationRef.current;
      element?.classList.add('shake');
      setTimeout(() => element?.classList.remove('shake'), 500);
      return;
    }

    setIsSearching(true);
    const keyword = keywords.find(k => k.keyword === selectedKeyword)!;
    const location = locations.find(l => `${l.location}, ${l.state}` === selectedLocation)!;
    
    try {
      const keywordSlug = generateSlug(keyword.keyword);
      const locationSlug = generateSlug(`${location.location}-${location.state}`);
      await router.push(`/${keywordSlug}/${locationSlug}`);
    } catch (error) {
      setErrors({ general: 'Failed to perform search. Please try again.' });
      setShowError(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <AnimatedContainer 
      className="w-full max-w-4xl mx-auto p-4"
      variants={fadeInScale}
    >
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        .input-focus-ring {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .input-focus-ring:focus-within {
          transform: scale(1.01);
        }
        .error-input {
          border-color: rgb(239 68 68);
          animation: errorPulse 1.5s infinite;
        }
        @keyframes errorPulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 4px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>

      <AnimatePresence>
        {showError && Object.keys(errors).length > 0 && (
          <div className="mb-4">
            {Object.entries(errors).map(([key, message]) => (
              message && (
                <ErrorMessage
                  key={key}
                  message={message}
                  className="mb-2"
                  onClose={() => {
                    setErrors(prev => ({ ...prev, [key]: undefined }));
                    setShowError(false);
                  }}
                />
              )
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row gap-4">
        <AnimatedContainer 
          className="relative flex-1" 
          ref={keywordRef}
          variants={slideInFromRight}
          delay={0.2}
        >
          <div className="input-focus-ring">
            <input
              type="text"
              placeholder="Search for a service..."
              className={`w-full p-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${errors.keyword ? 'error-input' : ''}`}
              value={selectedKeyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              onClick={() => setShowKeywordDropdown(true)}
              disabled={isLoading}
            />
          </div>
          <AnimatePresence>
            {showKeywordDropdown && filteredKeywords.length > 0 && (
              <VirtualizedDropdown
                items={filteredKeywords}
                renderItem={(item) => (
                  <div className="p-2 transition-all duration-200 hover:pl-4">
                    {item.keyword}
                  </div>
                )}
                onSelect={(item) => {
                  setSelectedKeyword(item.keyword);
                  setShowKeywordDropdown(false);
                }}
                itemHeight={40}
                maxHeight={240}
                className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg"
              />
            )}
          </AnimatePresence>
        </AnimatedContainer>

        <AnimatedContainer 
          className="relative flex-1" 
          ref={locationRef}
          variants={slideInFromRight}
          delay={0.4}
        >
          <div className="input-focus-ring">
            <input
              type="text"
              placeholder="Enter location..."
              className={`w-full p-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${errors.location ? 'error-input' : ''}`}
              value={selectedLocation}
              onChange={(e) => handleLocationChange(e.target.value)}
              onClick={() => setShowLocationDropdown(true)}
              disabled={isLoading}
            />
          </div>
          <AnimatePresence>
            {showLocationDropdown && filteredLocations.length > 0 && (
              <VirtualizedDropdown
                items={filteredLocations}
                renderItem={(item) => (
                  <div className="p-2 transition-all duration-200 hover:pl-4">
                    {item.location}, {item.state}
                  </div>
                )}
                onSelect={(item) => {
                  setSelectedLocation(`${item.location}, ${item.state}`);
                  setShowLocationDropdown(false);
                }}
                itemHeight={40}
                maxHeight={240}
                className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg"
              />
            )}
          </AnimatePresence>
        </AnimatedContainer>

        <AnimatedContainer
          variants={bounceIn}
          delay={0.6}
        >
          <motion.button
            onClick={handleSearch}
            disabled={isLoading || isSearching}
            className={`bg-blue-600 text-white px-6 py-3 rounded-lg transition-all duration-200 
              ${isLoading || isSearching ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} 
              flex items-center justify-center min-w-[120px]`}
            whileHover={!isLoading && !isSearching ? { scale: 1.05 } : undefined}
            whileTap={!isLoading && !isSearching ? { scale: 0.95 } : undefined}
            animate={hasInteracted && !isLoading && !isSearching ? "animate" : "initial"}
            variants={pulseAnimation}
          >
            {isSearching ? (
              <LoadingSpinner size="sm" className="text-white" />
            ) : (
              'Search'
            )}
          </motion.button>
        </AnimatedContainer>
      </div>

      <AnimatePresence>
        {isLoading && (
          <AnimatedContainer
            className="text-center mt-4"
            variants={fadeInUp}
            delay={0.2}
          >
            <motion.div
              animate={{
                rotate: 360,
                transition: {
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }
              }}
            >
              <LoadingSpinner size="md" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-500 mt-2"
            >
              Loading search options...
            </motion.p>
          </AnimatedContainer>
        )}
      </AnimatePresence>
    </AnimatedContainer>
  );
}
