import React, { TextareaHTMLAttributes, forwardRef, ReactNode, useId } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  helperText?: ReactNode;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, helperText, error, id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className={`field ${className}`}>
        <label 
          htmlFor={textareaId} 
          className="field-label"
        >
          {label}
        </label>
        
        {helperText && (
          <div className="field-helper">
            {helperText}
          </div>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={`field-input textarea-input${error ? " field-input-error" : ""}`}
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

Textarea.displayName = 'Textarea';
