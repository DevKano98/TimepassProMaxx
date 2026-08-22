import React from 'react';
import { Search } from 'lucide-react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-body font-medium text-[14px]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-canvas text-ink placeholder:text-muted rounded-md px-4 py-3 h-[48px] border border-hairline transition-all duration-150 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-surface-soft disabled:text-muted-soft disabled:cursor-not-allowed type-body-md ${
          error ? 'border-semantic-down focus:border-semantic-down focus:ring-semantic-down' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-semantic-down text-[13px]">{error}</span>}
      {helperText && !error && <span className="text-muted text-[13px]">{helperText}</span>}
    </div>
  );
};

interface SearchInputPillProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInputPill: React.FC<SearchInputPillProps> = ({
  className = '',
  value,
  ...props
}) => {
  return (
    <div className={`relative flex items-center w-full max-w-md ${className}`}>
      <Search className="absolute left-4 w-4 h-4 text-muted pointer-events-none" />
      <input
        type="text"
        value={value}
        className="w-full bg-surface-strong text-ink placeholder:text-muted rounded-pill pl-11 pr-5 py-3 h-[44px] border-none focus:outline-none focus:ring-2 focus:ring-primary/40 type-body-md transition-all"
        {...props}
      />
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
  error?: string;
}

export const SelectInput: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-body font-medium text-[14px]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full bg-canvas text-ink rounded-md px-4 py-3 h-[48px] border border-hairline transition-all duration-150 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-surface-soft disabled:cursor-not-allowed appearance-none type-body-md cursor-pointer ${
            error ? 'border-semantic-down' : ''
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error && <span className="text-semantic-down text-[13px]">{error}</span>}
    </div>
  );
};
