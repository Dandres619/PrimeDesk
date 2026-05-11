import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { CustomDatePicker } from './CustomDatePicker';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, isValid } from 'date-fns';

interface DatePickerInputProps {
  value: string;
  onChange: (v: string) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  className?: string;
  error?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
}

export function DatePickerInput({ value, onChange, minDate, maxDate, placeholder = 'DD/MM/YYYY', className = '', error, onBlur, onFocus }: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const parseDate = (val: string) => {
    if (!val || val.length < 10) return null;
    if (val.includes('-')) {
      const d = new Date(val + 'T00:00:00');
      return isValid(d) ? d : null;
    }
    const [d, m, y] = val.split('/').map(Number);
    const date = new Date(y, m - 1, d);
    return isValid(date) && y >= 1000 ? date : null;
  };

  useEffect(() => {
    if (value) {
      try {
        const d = parseDate(value);
        if (d && isValid(d)) {
          const newFormatted = format(d, 'dd/MM/yyyy');
          if (inputValue !== newFormatted) {
            setInputValue(newFormatted);
          }
        }
      } catch (e) { }
    } else if (!inputValue || inputValue.length === 10) {
      setInputValue('');
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);

    if (val.length >= 2) {
      let day = parseInt(val.slice(0, 2));
      if (day > 31) val = '31' + val.slice(2);
      else if (day === 0 && val.length === 2) val = '01' + val.slice(2);
    }
    if (val.length >= 4) {
      let month = parseInt(val.slice(2, 4));
      if (month > 12) val = val.slice(0, 2) + '12' + val.slice(4);
      else if (month === 0 && val.length === 4) val = val.slice(0, 2) + '01' + val.slice(4);
    }

    let formatted = val;
    if (val.length > 2) formatted = val.slice(0, 2) + '/' + val.slice(2);
    if (val.length > 4) formatted = formatted.slice(0, 5) + '/' + val.slice(4);

    setInputValue(formatted);

    if (formatted.length === 10) {
      const parsed = parseDate(formatted);
      if (parsed) {
        onChange(format(parsed, 'yyyy-MM-dd'));
      } else {
        onChange(formatted);
      }
    } else {
      onChange(formatted);
    }
  };

  const handleInputBlur = () => {
    if (onBlur) onBlur();
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open && onFocus) onFocus();
      if (!open && onBlur) onBlur();
    }}>
      <div className="relative w-full">
        <div className={`relative flex items-center w-full h-11 border rounded-md overflow-hidden transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 bg-white ${error ? 'border-red-500 ring-1 ring-red-500/20' : 'border-slate-300 hover:border-slate-400'} ${className}`}>
          <PopoverTrigger asChild>
            <button type="button" className="pl-3 pr-2 h-full flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 border-r border-slate-200" tabIndex={-1}>
              <CalendarIcon className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            className="flex-1 h-full px-3 text-sm outline-none bg-transparent"
            maxLength={10}
          />
        </div>
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <CustomDatePicker
          value={value}
          onChange={(v) => { onChange(v); setIsOpen(false); }}
          minDate={minDate || new Date(1900, 0, 1)}
          maxDate={maxDate || new Date(2100, 0, 1)}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
