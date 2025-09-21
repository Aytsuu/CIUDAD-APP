import React from 'react';
import { View } from 'react-native';
interface SkeletonProps {
  className?: string;
}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <View
      className={`animate-pulse rounded-md bg-primary/10 ${className || ''}`}
      {...props}
    />
  );
}

export { Skeleton };