import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';

// ============================
// Input Component
// ============================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full mb-4">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-300 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-white dark:bg-zinc-900 border ${
              error 
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-2 focus:ring-zinc-900/5 dark:focus:ring-white/5'
            } rounded-lg px-3 py-2.5 text-zinc-900 dark:text-zinc-100 text-sm outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 ${
              icon ? 'pl-10' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 dark:text-red-400 ml-1 font-medium animate-fade-in">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
