import Icon from './Icon';

const QuantityStepper = ({ value = 0, onIncrement, onDecrement, size = 'md', min = 1 }) => (
  <div className={`stepper stepper--${size}`}>
    <button
      type="button"
      className="stepper__btn"
      onClick={onDecrement}
      aria-label="Decrease quantity"
    >
      <Icon name="minus" size={13} />
    </button>
    <span className="stepper__value" aria-live="polite">
      {value}
    </span>
    <button
      type="button"
      className="stepper__btn"
      onClick={onIncrement}
      aria-label="Increase quantity"
    >
      <Icon name="plus" size={13} />
    </button>
    <span className="sr-only">{`Quantity ${value}, minimum ${min}`}</span>
  </div>
);

export default QuantityStepper;
