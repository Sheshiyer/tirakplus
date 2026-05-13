import React, { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', elevated = false, children, ...props }, ref) => {
    const baseClasses = 'card-surface';
    const borderClass = elevated ? '' : 'card-bordered';
    const shadowClass = elevated ? 'card-elevated' : '';
    
    const combinedClasses = `${baseClasses} ${borderClass} ${shadowClass} ${className}`;

    return (
      <div ref={ref} className={combinedClasses.trim()} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`card-header ${className}`.trim()} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`card-content ${className}`.trim()} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';
