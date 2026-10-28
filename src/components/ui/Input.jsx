import { forwardRef, useId, useState } from 'react';
import Icon from './Icon';

export const Field = ({ label, htmlFor, error, hint, required, children, className = '' }) => (
  <div className={`field ${error ? 'field--error' : ''} ${className}`.trim()}>
    {label ? (
      <label className="field__label" htmlFor={htmlFor}>
        {label}
        {required ? <span className="field__required">*</span> : null}
      </label>
    ) : null}
    {children}
    {error ? (
      <p className="field__error" role="alert">
        <Icon name="alert" size={13} /> {error}
      </p>
    ) : hint ? (
      <p className="field__hint">{hint}</p>
    ) : null}
  </div>
);

const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      required,
      icon = null,
      type = 'text',
      className = '',
      containerClassName = '',
      ...rest
    },
    ref,
  ) => {
    const id = useId();
    const [reveal, setReveal] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && reveal ? 'text' : type;

    return (
      <Field
        label={label}
        htmlFor={id}
        error={error}
        hint={hint}
        required={required}
        className={containerClassName}
      >
        <div className={`input-wrap ${icon ? 'input-wrap--icon' : ''} ${isPassword ? 'input-wrap--password' : ''}`.trim()}>
          {icon ? <span className="input-wrap__icon">{icon}</span> : null}
          <input
            ref={ref}
            id={id}
            type={inputType}
            className={`input ${error ? 'input--invalid' : ''} ${className}`.trim()}
            aria-invalid={Boolean(error)}
            aria-required={required || undefined}
            {...rest}
          />
          {isPassword ? (
            <button
              type="button"
              className="input-wrap__toggle"
              onClick={() => setReveal((current) => !current)}
              aria-label={reveal ? 'Hide password' : 'Show password'}
            >
              <Icon name={reveal ? 'eyeOff' : 'eye'} size={16} />
            </button>
          ) : null}
        </div>
      </Field>
    );
  },
);

Input.displayName = 'Input';

export const Textarea = forwardRef(({ label, error, hint, required, rows = 3, ...rest }, ref) => {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} error={error} hint={hint} required={required}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={`textarea ${error ? 'input--invalid' : ''}`.trim()}
        {...rest}
      />
    </Field>
  );
});

Textarea.displayName = 'Textarea';

export const Select = forwardRef(
  ({ label, error, hint, required, options = [], placeholder, children, ...rest }, ref) => {
    const id = useId();
    return (
      <Field label={label} htmlFor={id} error={error} hint={hint} required={required}>
        <div className="select-wrap">
          <select
            ref={ref}
            id={id}
            className={`select ${error ? 'input--invalid' : ''}`.trim()}
            {...rest}
          >
            {placeholder ? (
              <option value="">{placeholder}</option>
            ) : null}
            {children ||
              options.map((option) => (
                <option key={option.value ?? option} value={option.value ?? option}>
                  {option.label ?? option}
                </option>
              ))}
          </select>
          <Icon name="chevronDown" size={14} className="select-wrap__icon" />
        </div>
      </Field>
    );
  },
);

Select.displayName = 'Select';

export default Input;
