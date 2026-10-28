import { forwardRef } from 'react';

const VARIANTS = {
  primary: 'btn btn--primary',
  secondary: 'btn btn--secondary',
  outline: 'btn btn--outline',
  ghost: 'btn btn--ghost',
  danger: 'btn btn--danger',
};

const SIZES = { sm: 'btn--sm', md: '', lg: 'btn--lg' };

const Button = forwardRef(
  (
    {
      as: Component = 'button',
      variant = 'primary',
      size = 'md',
      block = false,
      loading = false,
      iconLeft = null,
      iconRight = null,
      className = '',
      children,
      disabled,
      type,
      ...rest
    },
    ref,
  ) => {
    const classes = [
      VARIANTS[variant] || VARIANTS.primary,
      SIZES[size] || '',
      block ? 'btn--block' : '',
      loading ? 'btn--loading' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Component
        ref={ref}
        className={classes}
        disabled={Component === 'button' ? disabled || loading : undefined}
        type={Component === 'button' ? type || 'button' : undefined}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading ? <span className="btn__spinner" aria-hidden="true" /> : iconLeft}
        {children ? <span className="btn__label">{children}</span> : null}
        {iconRight}
      </Component>
    );
  },
);

Button.displayName = 'Button';

export default Button;
