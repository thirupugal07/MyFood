import Icon from '../ui/Icon';
import { STATUS_META } from '../../lib/orderStatus';

const StatusPill = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.placed;
  return (
    <span className={`status-pill status-pill--${meta.tone}`}>
      <Icon name={meta.icon} size={11} /> {meta.label}
    </span>
  );
};

export default StatusPill;
