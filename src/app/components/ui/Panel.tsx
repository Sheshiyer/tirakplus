import React, { HTMLAttributes, forwardRef } from 'react';

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'quiet' | 'trust';
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ className = '', variant = 'quiet', children, ...props }, ref) => {
    const combinedClasses = `panel panel-${variant} ${className}`;

    return (
      <div ref={ref} className={combinedClasses.trim()} {...props}>
        {children}
      </div>
    );
  }
);

Panel.displayName = 'Panel';
