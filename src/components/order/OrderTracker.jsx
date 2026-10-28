import { useMemo, useState } from 'react';
import Icon from '../ui/Icon';
import { useInterval } from '../../hooks/useInterval';
import { formatTime } from '../../lib/format';

/**
 * Renders the delivery timeline. It ticks every second so the active stage
 * moves on its own - exactly what a socket/polling feed would drive from a
 * real backend.
 */
const OrderTracker = ({ timeline, cancelled }) => {
  const [, setTick] = useState(0);
  useInterval(() => setTick((value) => value + 1), cancelled ? null : 1000);

  const { activeIndex, progress } = useMemo(() => {
    const now = Date.now();
    const reached = timeline.filter((entry) => new Date(entry.at).getTime() <= now);
    const index = Math.max(0, reached.length - 1);
    const value = cancelled ? 0 : ((index + 1) / timeline.length) * 100;
    return { activeIndex: index, progress: value };
  }, [timeline, cancelled, setTick]);

  if (cancelled) {
    return (
      <div className="tracker tracker--cancelled">
        <Icon name="alert" size={16} />
        <p>This order was cancelled. Any amount paid is refunded within 3-5 working days.</p>
      </div>
    );
  }

  return (
    <div className="tracker">
      <div className="tracker__bar">
        <span className="tracker__bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <ol className="tracker__steps">
        {timeline.map((entry, index) => {
          const state = index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'todo';
          return (
            <li key={entry.status} className={`tracker__step tracker__step--${state}`}>
              <span className="tracker__dot">
                {state === 'done' ? <Icon name="check" size={11} /> : null}
              </span>
              <div>
                <p className="tracker__label">{entry.label}</p>
                <p className="tracker__desc">{entry.description}</p>
                {state !== 'todo' ? <p className="tracker__time">{formatTime(entry.at)}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default OrderTracker;
