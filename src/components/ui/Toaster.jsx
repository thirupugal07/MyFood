import Icon from './Icon';

const ICONS = { success: 'checkCircle', error: 'alert', warning: 'alert', info: 'info' };

const Toaster = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;
  return (
    <div className="toaster" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type}`} role="status">
          <span className="toast__icon">
            <Icon name={ICONS[toast.type] || 'info'} size={16} />
          </span>
          <div className="toast__body">
            {toast.title ? <p className="toast__title">{toast.title}</p> : null}
            <p className="toast__message">{toast.message}</p>
          </div>
          <button
            type="button"
            className="toast__close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <Icon name="close" size={13} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toaster;
