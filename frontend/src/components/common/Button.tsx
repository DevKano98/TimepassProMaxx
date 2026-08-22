import React from 'react';

export type ButtonVariant =
  | 'primary'
  | 'secondary-light'
  | 'secondary-dark'
  | 'outline-on-dark'
  | 'tertiary-text'
  | 'pill-cta';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  let baseStyles =
    'inline-flex items-center justify-center font-sans font-semibold transition-colors duration-150 select-none cursor-pointer focus:outline-none';

  let variantStyles = '';

  switch (variant) {
    case 'primary':
      variantStyles =
        'bg-primary text-on-primary rounded-pill px-5 py-3 h-[44px] text-[16px] leading-[1.15] hover:bg-primary-active active:bg-primary-active disabled:bg-primary-disabled disabled:cursor-not-allowed';
      break;
    case 'pill-cta':
      variantStyles =
        'bg-primary text-on-primary rounded-pill px-8 py-4 h-[56px] text-[16px] leading-[1.15] hover:bg-primary-active active:bg-primary-active disabled:bg-primary-disabled disabled:cursor-not-allowed shadow-soft';
      break;
    case 'secondary-light':
      variantStyles =
        'bg-surface-strong text-ink rounded-pill px-5 py-3 h-[44px] text-[16px] leading-[1.15] hover:bg-hairline active:bg-hairline disabled:opacity-50 disabled:cursor-not-allowed';
      break;
    case 'secondary-dark':
      variantStyles =
        'bg-surface-dark-elevated text-on-dark rounded-pill px-5 py-3 h-[44px] text-[16px] leading-[1.15] hover:bg-surface-dark-elevated/80 active:bg-surface-dark-elevated/90 disabled:opacity-50 disabled:cursor-not-allowed';
      break;
    case 'outline-on-dark':
      variantStyles =
        'bg-transparent text-on-dark border border-white/20 hover:border-white/50 rounded-pill px-[19px] py-[11px] h-[44px] text-[16px] leading-[1.15] active:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed';
      break;
    case 'tertiary-text':
      variantStyles =
        'bg-transparent text-primary hover:text-primary-active active:text-primary-active text-[16px] font-semibold p-0 h-auto underline-offset-4 hover:underline disabled:text-muted disabled:cursor-not-allowed';
      break;
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="mr-2 inline-flex items-center">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="ml-2 inline-flex items-center">{icon}</span>}
    </button>
  );
};
