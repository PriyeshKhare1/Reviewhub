import { createContext, useState, useEffect } from "react";

const ThemeContext = createContext();

// Get initial theme from localStorage or system preference
const getInitialTheme = () => {
  if (typeof window === 'undefined') return false;
  
  const saved = localStorage.getItem("theme");
  if (saved === "dark") return true;
  if (saved === "light") return false;
  
  // Check system preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(getInitialTheme);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e) => {
      // Only auto-switch if user hasn't set a preference
      const saved = localStorage.getItem("theme");
      if (!saved) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const setTheme = (dark) => {
    setIsDark(dark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
