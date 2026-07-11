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
      <div className="input-group">
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <div className={`input-wrapper ${error ? 'input-error' : ''}`}>
          {icon && <span className="input-icon">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={`input-field ${icon ? 'has-icon' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="input-error-text">{error}</p>}
        {helperText && !error && (
          <p className="input-helper-text">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
