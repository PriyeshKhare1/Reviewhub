import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SlidersHorizontal, 
  X, 
  Calendar, 
  Star, 
  Tag, 
  ArrowUpDown,
  Check,
  RotateCcw
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const categories = [
  { id: 'tech', name: 'Tech', color: 'bg-blue-500' },
  { id: 'lifestyle', name: 'Lifestyle', color: 'bg-pink-500' },
  { id: 'retail', name: 'Retail', color: 'bg-purple-500' },
  { id: 'food', name: 'Food', color: 'bg-orange-500' },
  { id: 'service', name: 'Service', color: 'bg-teal-500' },
  { id: 'other', name: 'Other', color: 'bg-amber-500' },
];

const sortOptions = [
  { id: 'newest', name: 'Newest First', icon: '📅' },
  { id: 'oldest', name: 'Oldest First', icon: '📆' },
  { id: 'highest', name: 'Highest Rated', icon: '⭐' },
  { id: 'lowest', name: 'Lowest Rated', icon: '📉' },
  { id: 'mostHelpful', name: 'Most Helpful', icon: '👍' },
  { id: 'mostViewed', name: 'Most Viewed', icon: '👁️' },
];

export default function AdvancedSearch({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}) {
  const [localFilters, setLocalFilters] = useState({
    categories: filters?.categories || [],
    minRating: filters?.minRating || 0,
    maxRating: filters?.maxRating || 5,
    dateFrom: filters?.dateFrom || '',
    dateTo: filters?.dateTo || '',
    sortBy: filters?.sortBy || 'newest',
    tags: filters?.tags || [],
  });

  const [tagInput, setTagInput] = useState('');

  const handleCategoryToggle = (categoryId) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!localFilters.tags.includes(tagInput.trim().toLowerCase())) {
        setLocalFilters(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim().toLowerCase()]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setLocalFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleReset = () => {
    setLocalFilters({
      categories: [],
      minRating: 0,
      maxRating: 5,
      dateFrom: '',
      dateTo: '',
      sortBy: 'newest',
      tags: [],
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const activeFilterCount = 
    localFilters.categories.length +
    (localFilters.minRating > 0 ? 1 : 0) +
    (localFilters.maxRating < 5 ? 1 : 0) +
    (localFilters.dateFrom ? 1 : 0) +
    (localFilters.dateTo ? 1 : 0) +
    localFilters.tags.length +
    (localFilters.sortBy !== 'newest' ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                  <SlidersHorizontal className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Advanced Filters
                  </h2>
                  {activeFilterCount > 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Categories
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryToggle(category.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        localFilters.categories.includes(category.id)
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {category.name}
                      </span>
                      {localFilters.categories.includes(category.id) && (
                        <Check className="w-4 h-4 text-violet-500 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Range */}
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Rating Range
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                      Min Rating
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          onClick={() => setLocalFilters(prev => ({ ...prev, minRating: rating }))}
                          className={`p-2 rounded transition-colors ${
                            rating <= localFilters.minRating
                              ? 'text-yellow-500'
                              : 'text-slate-300 dark:text-slate-600 hover:text-yellow-400'
                          }`}
                        >
                          <Star className={`w-5 h-5 ${rating <= localFilters.minRating ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                      Max Rating
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          onClick={() => setLocalFilters(prev => ({ ...prev, maxRating: rating }))}
                          className={`p-2 rounded transition-colors ${
                            rating <= localFilters.maxRating
                              ? 'text-yellow-500'
                              : 'text-slate-300 dark:text-slate-600 hover:text-yellow-400'
                          }`}
                        >
                          <Star className={`w-5 h-5 ${rating <= localFilters.maxRating ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Range
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                      From
                    </label>
                    <Input
                      type="date"
                      value={localFilters.dateFrom}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">
                      To
                    </label>
                    <Input
                      type="date"
                      value={localFilters.dateTo}
                      onChange={(e) => setLocalFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Filter by Tags
                </h3>
                <Input
                  type="text"
                  placeholder="Type a tag and press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="mb-2"
                />
                {localFilters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {localFilters.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-violet-900 dark:hover:text-violet-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort By */}
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  Sort By
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {sortOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setLocalFilters(prev => ({ ...prev, sortBy: option.id }))}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        localFilters.sortBy === option.id
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {option.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 p-4 flex gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
              >
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
