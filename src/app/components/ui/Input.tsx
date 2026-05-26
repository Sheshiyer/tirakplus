import React, { InputHTMLAttributes, forwardRef, ReactNode, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: ReactNode;
  error?: string;
  /**
   * When false, the label stays in the DOM for screen readers but is
   * visually hidden (sr-only). Use for chat composers / inline forms
   * where surrounding context already names the field. Defaults true.
   */
  labelVisible?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, helperText, error, id, labelVisible = true, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className={`field ${className}`}>
        <label
          htmlFor={inputId}
          className={`field-label${labelVisible ? '' : ' sr-only'}`}
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
