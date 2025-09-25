import React from 'react';

/* ---------- Card ---------- */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-lg border-2 border-brand-200 bg-brand-100 ${className}`.trim()}
      {...props}
    />
  )
);
Card.displayName = 'Card';

/* ---------- CardHeader ---------- */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`flex flex-col space-y-1.5${className}`.trim()}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

/* ---------- CardTitle ---------- */
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = '', ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-lg font-bold leading-none tracking-tight ${className}`.trim()}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

/* ---------- CardDescription ---------- */
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className = '', ...props }, ref) => (
    <p
      ref={ref}
      className={`text-sm text-gray-500 ${className}`.trim()}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

/* ---------- CardContent ---------- */
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`${className}`.trim()} {...props} />
  )
);
CardContent.displayName = 'CardContent';

/* ---------- CardFooter ---------- */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center px-6 pb-6 ${className}`.trim()}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';