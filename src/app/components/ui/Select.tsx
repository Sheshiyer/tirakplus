import React, { SelectHTMLAttributes, forwardRef, ReactNode, useId } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  helperText?: ReactNode;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, helperText, error, id, options, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className={`field ${className}`}>
        <label 
          htmlFor={selectId} 
          className="field-label"
        >
          {label}
        </label>
        
        {helperText && (
          <div className="field-helper">
            {helperText}
          </div>
        )}

        <div className="select-wrap">
          <select
            ref={ref}
            id={selectId}
            className={`field-input select-input${error ? " field-input-error" : ""}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="select-arrow" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>

        {error && (
          <div className="field-error">
            {error}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
