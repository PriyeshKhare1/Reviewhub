import * as React from "react";
import { cn } from "../../lib/utils";

const Select = ({ children, value, onValueChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = React.useRef(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={selectRef} className="relative">
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { 
            value, 
            onValueChange, 
            isOpen, 
            setIsOpen,
            children: child.props.children 
          });
        }
        if (child.type === SelectContent) {
          return isOpen ? React.cloneElement(child, { 
            value,
            onValueChange, 
            setIsOpen 
          }) : null;
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, value, onValueChange, isOpen, setIsOpen, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white ring-offset-white dark:ring-offset-slate-900 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
      <svg 
        className={cn("h-4 w-4 opacity-50 transition-transform text-slate-500 dark:text-slate-400", isOpen && "rotate-180")} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder, value }) => {
  return <span className={value ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}>{value || placeholder}</span>;
};

const SelectContent = ({ className, children, value, onValueChange, setIsOpen, ...props }) => {
  return (
    <div
      className={cn(
        "absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl dark:shadow-2xl animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      <div className="p-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
        {React.Children.map(children, child =>
          React.cloneElement(child, { 
            onValueChange, 
            setIsOpen,
            isSelected: child.props.value === value
          })
        )}
      </div>
    </div>
  );
};

const SelectItem = ({ className, children, value, onValueChange, setIsOpen, isSelected, ...props }) => {
  return (
    <div
      onClick={() => {
        onValueChange(value);
        setIsOpen(false);
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 px-3 text-sm outline-none transition-all duration-150 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 focus:bg-slate-100 dark:focus:bg-slate-700",
        isSelected && "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium",
        className
      )}
      {...props}
    >
      {children}
      {isSelected && (
        <svg className="ml-auto h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </div>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
