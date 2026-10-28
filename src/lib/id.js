/** RFC4122-ish id, good enough for client side keys. */
export const uid = (prefix = '') => {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}${prefix ? '_' : ''}${time}${random}`;
};

/** MF-8F3K2A - human friendly order number */
export const orderNumber = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `MF-${suffix}`;
};
