/** Shared status metadata so cards, pills and the tracker never drift apart. */
export const STATUS_META = {
  placed: { label: 'Order placed', tone: 'info', icon: 'receipt' },
  confirmed: { label: 'Confirmed', tone: 'info', icon: 'check' },
  preparing: { label: 'Preparing', tone: 'warning', icon: 'clock' },
  'out-for-delivery': { label: 'Out for delivery', tone: 'brand', icon: 'bike' },
  delivered: { label: 'Delivered', tone: 'success', icon: 'checkCircle' },
  cancelled: { label: 'Cancelled', tone: 'danger', icon: 'alert' },
};

export const isActiveOrder = (status) =>
  !['delivered', 'cancelled'].includes(status);

export const canCancelOrder = (status) => ['placed', 'confirmed'].includes(status);
