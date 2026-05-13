import React, { InputHTMLAttributes, forwardRef, ReactNode, useId } from 'react';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, helperText, error, id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <div className={`checkbox-field ${className}`}>
        <div className="checkbox-row">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={`checkbox-input${error ? " checkbox-input-error" : ""}`}
            {...props}
          />
          <div className="checkbox-copy">
          <label 
            htmlFor={checkboxId} 
            className="field-label checkbox-label"
          >
            {label}
          </label>
          {helperText && (
            <div className="field-helper">
              {helperText}
            </div>
          )}
          </div>
        </div>

        {error && (
          <div className="field-error checkbox-error">
            {error}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
