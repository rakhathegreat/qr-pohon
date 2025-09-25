import React from 'react';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-brand-600 text-white',
  secondary: 'bg-gray-200 text-gray-800',
  destructive: 'bg-red-600 text-white',
  outline: 'border border-brand-200 bg-brand-50 text-gray-800',
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className = '', ...props }, ref) => {
    const base = 'inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold';
    const variantClass = variantStyles[variant];
    return (
      <span
        ref={ref}
        className={`${base} ${variantClass} ${className}`.trim()}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;