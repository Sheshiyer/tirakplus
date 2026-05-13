import React from 'react';

type SkeletonProps = {
  className?: string;
};

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div 
      className={`skeleton ${className}`}
      aria-hidden="true"
    />
  );
};

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <Skeleton className="skeleton-title" />
    <Skeleton className="skeleton-line" />
    <Skeleton className="skeleton-line skeleton-line-medium" />
    <Skeleton className="skeleton-button" />
  </div>
);

export const SkeletonProfile = () => (
  <div className="skeleton-profile">
    <Skeleton className="skeleton-media" />
    <div className="skeleton-profile-body">
      <Skeleton className="skeleton-title skeleton-title-wide" />
      <Skeleton className="skeleton-line skeleton-line-short" />
      <div className="skeleton-pill-row">
        <Skeleton className="skeleton-pill" />
        <Skeleton className="skeleton-pill" />
      </div>
    </div>
  </div>
);
