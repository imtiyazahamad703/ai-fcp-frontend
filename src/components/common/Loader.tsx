// ============================
// Loader Component
// ============================

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  sm: 20,
  md: 36,
  lg: 52,
};

export const Loader = ({
  size = 'md',
  text,
  fullScreen = false,
}: LoaderProps) => {
  const dimension = sizeMap[size];

  const spinner = (
    <div className="loader-container">
      <svg
        className="animate-spin"
        width={dimension}
        height={dimension}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="var(--color-border-secondary)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="url(#loader-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="loader-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--color-primary-500)" />
            <stop offset="1" stopColor="var(--color-accent-500)" />
          </linearGradient>
        </defs>
      </svg>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="loader-fullscreen">{spinner}</div>;
  }

  return spinner;
};
