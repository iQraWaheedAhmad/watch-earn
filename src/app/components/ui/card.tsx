import React from 'react';

// Utility function to merge class names
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...props }: DivProps) => {
  return (
    <div
      className={cn('rounded-lg border bg-white p-4 shadow-sm', className)}
      {...props}
    />
  );
};

export const CardHeader = ({ className, ...props }: DivProps) => {
  return (
    <div className={cn('mb-4 border-b pb-2', className)} {...props} />
  );
};

export const CardTitle = ({ className, ...props }: DivProps) => {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props} />
  );
};

export const CardContent = ({ className, ...props }: DivProps) => {
  return (
    <div className={cn('space-y-2 text-gray-700', className)} {...props} />
  );
};
