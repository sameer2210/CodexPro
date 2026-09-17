import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const SelectContext = createContext(null);

const Select = ({ children, value, onValueChange, defaultValue }) => {
  const [selected, setSelected] = useState(value !== undefined ? value : defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const currentValue = value !== undefined ? value : selected;

  const handleChange = (newValue) => {
    setSelected(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{ selected: currentValue, handleChange, isOpen, setIsOpen }}>
      <div ref={containerRef} className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children, className = '', ...props }) => {
  const { isOpen, setIsOpen } = useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`w-full bg-slate-800/60 border border-slate-600/60 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-left flex items-center justify-between transition-all backdrop-blur-sm ${className}`}
      {...props}
    >
      <span className="block truncate">{children}</span>
      <span className="ml-2 text-xs text-slate-400">▼</span>
    </button>
  );
};

const SelectContent = ({ children, className = '', ...props }) => {
  const { isOpen } = useContext(SelectContext);
  if (!isOpen) return null;

  return (
    <div
      className={`absolute left-0 right-0 top-full mt-2 bg-slate-800/90 border border-slate-600/60 text-white rounded-xl z-50 shadow-xl backdrop-blur-md max-h-60 overflow-auto py-1 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const SelectItem = ({ children, value, className = '', ...props }) => {
  const { selected, handleChange } = useContext(SelectContext);
  const isSelected = selected === value;

  return (
    <div
      onClick={() => handleChange(value)}
      className={`px-4 py-2.5 cursor-pointer transition-colors text-sm hover:bg-slate-700/80 ${
        isSelected ? 'font-semibold text-orange-400 bg-slate-700/40' : 'text-slate-200'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const SelectValue = ({ placeholder }) => {
  const { selected } = useContext(SelectContext);
  return <>{selected || placeholder || 'Select option...'}</>;
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };