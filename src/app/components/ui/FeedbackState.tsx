import React, { ReactNode } from 'react';
import { Button } from './Button';

type FeedbackStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  variant?: 'empty' | 'error' | 'success';
  className?: string;
};

export const FeedbackState = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  variant = 'empty',
  className = ''
}: FeedbackStateProps) => {
  
  return (
    <div className={`feedback-state feedback-state-${variant} ${className}`}>
      {icon && (
        <div className="feedback-icon">
          {icon}
        </div>
      )}
      <h3>
        {title}
      </h3>
      <p>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button 
          variant={variant === 'error' ? 'danger' : 'secondary'} 
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
