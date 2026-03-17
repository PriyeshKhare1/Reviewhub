import { useState } from "react";
import { X, Plus, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTED_TAGS = [
  "quality",
  "value",
  "service",
  "recommend",
  "authentic",
  "budget",
  "premium",
  "fast-delivery",
  "customer-service",
  "durable",
  "reliable",
  "easy-to-use",
  "worth-it",
  "overpriced",
  "scam",
  "verified",
];

export default function TagsInput({ tags = [], onChange, maxTags = 5 }) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = SUGGESTED_TAGS.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(tag)
  );

  const addTag = (tag) => {
    const cleanTag = tag.toLowerCase().trim().replace(/\s+/g, "-");
    if (cleanTag && !tags.includes(cleanTag) && tags.length < maxTags) {
      onChange([...tags, cleanTag]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <Tag className="w-4 h-4" />
        Tags
        <span className="text-slate-400 dark:text-slate-500 font-normal">
          ({tags.length}/{maxTags})
        </span>
      </label>

      {/* Tags Container */}
      <div className="relative">
        <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
          {/* Existing Tags */}
          <AnimatePresence mode="popLayout">
            {tags.map((tag) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-full"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="w-4 h-4 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>

          {/* Input */}
          {tags.length < maxTags && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={handleKeyDown}
              placeholder={tags.length === 0 ? "Add tags..." : ""}
              className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm"
            />
          )}
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && filteredSuggestions.length > 0 && inputValue && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto"
            >
              {filteredSuggestions.slice(0, 6).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addTag(suggestion)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4 text-blue-500" />
                  #{suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Popular Tags */}
      {tags.length < maxTags && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">
            Popular:
          </span>
          {SUGGESTED_TAGS.slice(0, 6)
            .filter((tag) => !tags.includes(tag))
            .map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                +{tag}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
