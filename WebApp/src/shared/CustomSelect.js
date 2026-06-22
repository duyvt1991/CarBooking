import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

function CustomSelect({ value, onChange, options, placeholder, className, disabled, isValueObject }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const stringifyValue = (val) => {
    if (isValueObject && typeof val === 'object' && val !== null) {
      return JSON.stringify(val);
    }
    return val?.toString() || '';
  };

  const selectedValueStr = stringifyValue(value);
  const selectedOption = options.find(opt => stringifyValue(opt.value) === selectedValueStr);

  const handleSelect = (val) => {
    // If it's a string representation of an object, we keep it as string so the parent onChange can parse it
    onChange({ target: { value: val } });
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative shrink-0 ${className || ''}`} style={{ minWidth: '120px' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full flex justify-between items-center px-3 py-2 border rounded-lg bg-white text-left text-sm disabled:opacity-50"
      >
        <span className={!selectedOption ? 'text-gray-400' : 'text-gray-800'}>
          {selectedOption ? selectedOption.label : placeholder || '-'}
        </span>
        <FaChevronDown className="text-gray-400 ml-2 text-xs" />
      </button>

      {isOpen && (
        <div className="absolute z-[3000] w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {placeholder && (
            <div
              onClick={() => handleSelect('')}
              className="px-3 py-2 text-sm text-gray-400 hover:bg-gray-100 cursor-pointer"
            >
              {placeholder}
            </div>
          )}
          {options.map((opt, idx) => {
            const optValStr = stringifyValue(opt.value);
            const isSelected = optValStr === selectedValueStr;
            return (
              <div
                key={idx}
                onClick={() => handleSelect(opt.value)}
                className={`px-3 py-2 text-sm hover:bg-green-50 hover:text-green-700 cursor-pointer ${isSelected ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-800'}`}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
