import { type ButtonHTMLAttributes, type ReactNode } from 'react';

// ============================
// Button Component
// ============================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-400)] text-white shadow-sm',
  secondary: 'bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] text-[var(--color-text-primary)]',
  ghost: 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
  danger: 'bg-red-500 hover:bg-red-400 text-white shadow-sm',
  success: 'bg-green-500 hover:bg-green-400 text-white shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-md)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
