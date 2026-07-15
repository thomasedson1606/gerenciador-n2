import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './CustomSelect.module.css';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  name?: string;
  optionClass?: (value: string) => string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Selecione...',
  className = '',
  name,
  optionClass
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`${styles.selectContainer} ${isOpen ? styles.containerOpen : ''} ${className}`} ref={containerRef}>
      <div 
        className={`${styles.selectTrigger} ${isOpen ? styles.open : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <span className={`${selectedOption ? styles.value : styles.placeholder} ${(selectedOption && optionClass)?.(value) || ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`} />
      </div>

      {isOpen && (
        <div 
          className={styles.dropdown}
          onMouseDown={(e) => e.preventDefault()}
        >
          {options.length === 0 ? (
            <div className={styles.noOptions}>Nenhuma opção</div>
          ) : (
            options.map((option) => (
              <div 
                key={option.value} 
                className={`${styles.option} ${option.value === value ? styles.selected : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                <span className={optionClass?.(option.value) || ''}>{option.label}</span>
              </div>
            ))
          )}
        </div>
      )}
      
      {/* Hidden input to support native form submissions if needed */}
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
};
