import Icon from './Icon';

const EmptyState = ({ icon = 'receipt', title, message, action = null, compact = false }) => (
  <div className={`empty ${compact ? 'empty--compact' : ''}`.trim()}>
    <span className="empty__icon">
      <Icon name={icon} size={compact ? 24 : 30} />
    </span>
    <h3 className="empty__title">{title}</h3>
    {message ? <p className="empty__text">{message}</p> : null}
    {action ? <div className="empty__action">{action}</div> : null}
  </div>
);

export default EmptyState;
