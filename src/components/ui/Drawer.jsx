import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

const Drawer = ({ open, onClose, title, subtitle, children, footer, side = 'right' }) => {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="drawer-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <aside
        ref={panelRef}
        tabIndex={-1}
        className={`drawer drawer--${side}`}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Panel'}
      >
        <header className="drawer__head">
          <div>
            <h2 className="drawer__title">{title}</h2>
            {subtitle ? <p className="drawer__subtitle">{subtitle}</p> : null}
          </div>
          <button type="button" className="drawer__close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </header>
        <div className="drawer__body">{children}</div>
        {footer ? <div className="drawer__foot">{footer}</div> : null}
      </aside>
    </div>,
    document.body,
  );
};

export default Drawer;
