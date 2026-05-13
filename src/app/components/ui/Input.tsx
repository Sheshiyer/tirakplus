import React, { InputHTMLAttributes, forwardRef, ReactNode, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, helperText, error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={`field ${className}`}>
        <label 
          htmlFor={inputId} 
          className="field-label"
        >
          {label}
        </label>
        
        {helperText && (
          <div className="field-helper">
            {helperText}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`field-input${error ? " field-input-error" : ""}`}
          {...props}
        />

        {error && (
          <div className="field-error">
            {error}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
