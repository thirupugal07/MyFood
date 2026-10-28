import {
  DELIVERY_FEE,
  TAX_RATE,
  FREE_DELIVERY_THRESHOLD,
  PACKAGING_FEE,
} from '../data/catalog';

export const round = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

/**
 * The single source of truth for money in the frontend.
 * The backend must recompute this again - never trust the client.
 */
export const calculateBill = ({ subtotal = 0, coupon = null, itemCount = 0 }) => {
  const safeSubtotal = round(Math.max(0, subtotal));

  const freeDelivery = safeSubtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = safeSubtotal === 0 ? 0 : freeDelivery ? 0 : DELIVERY_FEE;
  const packagingFee = itemCount === 0 ? 0 : PACKAGING_FEE;
  const tax = round(safeSubtotal * TAX_RATE);

  let discount = 0;
  let deliveryDiscount = 0;

  if (coupon && safeSubtotal >= (coupon.minOrder || 0)) {
    if (coupon.type === 'percent') {
      discount = round(Math.min((safeSubtotal * coupon.value) / 100, coupon.maxDiscount || Infinity));
    } else if (coupon.type === 'flat') {
      discount = round(Math.min(coupon.value, safeSubtotal));
    } else if (coupon.type === 'delivery') {
      deliveryDiscount = round(Math.min(deliveryFee, coupon.maxDiscount || deliveryFee));
    }
  }

  const total = round(
    Math.max(0, safeSubtotal + deliveryFee - deliveryDiscount + packagingFee + tax - discount),
  );

  return {
    subtotal: safeSubtotal,
    deliveryFee,
    deliveryDiscount,
    packagingFee,
    tax,
    discount,
    total,
    freeDelivery,
    amountToFreeDelivery: round(Math.max(0, FREE_DELIVERY_THRESHOLD - safeSubtotal)),
  };
};

export const couponIsUsable = (coupon, subtotal) =>
  Boolean(coupon) && subtotal >= (coupon.minOrder || 0);
