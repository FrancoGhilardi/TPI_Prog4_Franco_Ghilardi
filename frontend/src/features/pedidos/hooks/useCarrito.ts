import { useCartStore } from '@/store';

/** Selectores del carrito que usan las páginas de carrito y checkout. */
export const useCarrito = () => {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);
  const vaciar = useCartStore((s) => s.vaciar);
  return { items, total, vacio: items.length === 0, cambiarCantidad, quitar, vaciar };
};
