import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getItem, setItem, STORAGE_KEYS } from '../lib/storage';
import { calculateBill } from '../lib/pricing';

const CartContext = createContext(null);

const EMPTY_CART = {
  restaurantId: null,
  restaurantName: '',
  restaurantImage: '',
  restaurantArea: '',
  deliveryTimeMin: 0,
  items: [],
};

const readCart = () => {
  const stored = getItem(STORAGE_KEYS.cart, null);
  if (!stored || !Array.isArray(stored.items)) return EMPTY_CART;
  return { ...EMPTY_CART, ...stored };
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(readCart);
  const [coupon, setCoupon] = useState(() => getItem('cart-coupon', null));
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setItem(STORAGE_KEYS.cart, cart);
  }, [cart]);

  useEffect(() => {
    setItem('cart-coupon', coupon);
  }, [coupon]);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const addItem = useCallback(
    (menuItem, restaurant, quantity = 1) => {
      if (cart.restaurantId && cart.restaurantId !== restaurant.id) {
        return { added: false, conflict: true, currentRestaurant: cart.restaurantName };
      }

      setCart((current) => {
        const existing = current.items.find((line) => line.itemId === menuItem.id);
        const items = existing
          ? current.items.map((line) =>
              line.itemId === menuItem.id ? { ...line, qty: line.qty + quantity } : line,
            )
          : [
              ...current.items,
              {
                itemId: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                image: menuItem.image,
                isVeg: menuItem.isVeg,
                qty: quantity,
              },
            ];

        return {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          restaurantImage: restaurant.image,
          restaurantArea: restaurant.area,
          deliveryTimeMin: restaurant.deliveryTimeMin,
          items,
        };
      });

      return { added: true, conflict: false };
    },
    [cart.restaurantId, cart.restaurantName],
  );

  /** Throw away whatever was in the cart and start with this restaurant. */
  const replaceCart = useCallback((menuItem, restaurant, quantity = 1) => {
    setCoupon(null);
    setCart({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantImage: restaurant.image,
      restaurantArea: restaurant.area,
      deliveryTimeMin: restaurant.deliveryTimeMin,
      items: [
        {
          itemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          image: menuItem.image,
          isVeg: menuItem.isVeg,
          qty: quantity,
        },
      ],
    });
  }, []);

  /** Put a whole set of items back in the cart - used by "Reorder". */
  const restoreCart = useCallback((lines, restaurant) => {
    if (!lines.length || !restaurant) return;
    setCart({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantImage: restaurant.image,
      restaurantArea: restaurant.area || '',
      deliveryTimeMin: restaurant.deliveryTimeMin || 30,
      items: lines.map((line) => ({
        itemId: line.itemId,
        name: line.name,
        price: line.price,
        image: line.image,
        isVeg: line.isVeg,
        qty: line.qty,
      })),
    });
    setCoupon(null);
  }, []);

  const setQuantity = useCallback((itemId, quantity) => {
    setCart((current) => {
      const items =
        quantity <= 0
          ? current.items.filter((line) => line.itemId !== itemId)
          : current.items.map((line) => (line.itemId === itemId ? { ...line, qty: quantity } : line));

      if (items.length === 0) return EMPTY_CART;
      return { ...current, items };
    });
  }, []);

  const increment = useCallback(
    (itemId) => {
      const line = cart.items.find((item) => item.itemId === itemId);
      setQuantity(itemId, (line?.qty || 0) + 1);
    },
    [cart.items, setQuantity],
  );

  const decrement = useCallback(
    (itemId) => {
      const line = cart.items.find((item) => item.itemId === itemId);
      setQuantity(itemId, Math.max(0, (line?.qty || 0) - 1));
    },
    [cart.items, setQuantity],
  );

  const removeItem = useCallback(
    (itemId) => setQuantity(itemId, 0),
    [setQuantity],
  );

  const clearCart = useCallback(() => {
    setCart(EMPTY_CART);
    setCoupon(null);
  }, []);

  const getQuantity = useCallback(
    (itemId) => cart.items.find((line) => line.itemId === itemId)?.qty || 0,
    [cart.items],
  );

  const applyCoupon = useCallback((nextCoupon) => setCoupon(nextCoupon), []);
  const removeCoupon = useCallback(() => setCoupon(null), []);

  const itemCount = useMemo(
    () => cart.items.reduce((sum, line) => sum + line.qty, 0),
    [cart.items],
  );

  const subtotal = useMemo(
    () => cart.items.reduce((sum, line) => sum + line.price * line.qty, 0),
    [cart.items],
  );

  const bill = useMemo(
    () => calculateBill({ subtotal, coupon, itemCount }),
    [subtotal, coupon, itemCount],
  );

  const value = useMemo(
    () => ({
      cart,
      items: cart.items,
      restaurant: cart.restaurantId
        ? {
            id: cart.restaurantId,
            name: cart.restaurantName,
            image: cart.restaurantImage,
            area: cart.restaurantArea,
            deliveryTimeMin: cart.deliveryTimeMin,
          }
        : null,
      isEmpty: cart.items.length === 0,
      itemCount,
      subtotal,
      bill,
      coupon,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      replaceCart,
      restoreCart,
      setQuantity,
      increment,
      decrement,
      removeItem,
      clearCart,
      getQuantity,
      applyCoupon,
      removeCoupon,
    }),
    [
      cart,
      itemCount,
      subtotal,
      bill,
      coupon,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      addItem,
      replaceCart,
      restoreCart,
      setQuantity,
      increment,
      decrement,
      removeItem,
      clearCart,
      getQuantity,
      applyCoupon,
      removeCoupon,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside a CartProvider');
  return context;
};
