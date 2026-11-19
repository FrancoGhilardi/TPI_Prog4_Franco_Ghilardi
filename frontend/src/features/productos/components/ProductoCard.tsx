import { useState, type FC } from 'react';
import type { Producto } from '@/features/productos/types';
import { IMAGEN_RESPALDO } from '@/shared/constants';
import { Button, Card } from '@/shared/ui';
import { formatPrecio } from '@/shared/utils';
import { useCartStore } from '@/store';

export interface ProductoCardProps {
  producto: Producto;
}

export const ProductoCard: FC<ProductoCardProps> = ({ producto }) => {
  const agregar = useCartStore((s) => s.agregar);
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0);
  const [agregado, setAgregado] = useState(false);

  const sinStock = producto.stock === 0;
  const noDisponible = !producto.disponible || sinStock;
  const puedeAgregar = !noDisponible && enCarrito < producto.stock;
  const textoBoton = noDisponible
    ? 'No disponible'
    : !puedeAgregar
      ? 'Ya tenés todo el stock en el carrito'
      : agregado
        ? '¡Agregado al carrito!'
        : 'Agregar al carrito';

  const onAgregar = (): void => {
    agregar({ producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base });
    setAgregado(true);
    window.setTimeout(() => setAgregado(false), 1200);
  };

  return (
    <Card className="flex flex-col gap-3">
      <img
        src={producto.imagen_url ?? IMAGEN_RESPALDO}
        alt={producto.nombre}
        loading="lazy"
        className="h-40 w-full rounded-lg object-cover"
        onError={(e) => {
          e.currentTarget.src = IMAGEN_RESPALDO;
        }}
      />
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">{producto.categoria.nombre}</p>
        <h3 className="font-semibold">{producto.nombre}</h3>
        {producto.descripcion && <p className="text-sm text-slate-600">{producto.descripcion}</p>}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-orange-600">{formatPrecio(producto.precio_base)}</span>
        <span className={`text-xs ${sinStock || !producto.disponible ? 'text-red-600' : 'text-slate-500'}`}>
          {!producto.disponible ? 'No disponible' : sinStock ? 'Sin stock' : `${producto.stock} disponibles`}
        </span>
      </div>
      <Button disabled={!puedeAgregar} onClick={onAgregar}>
        {textoBoton}
      </Button>
    </Card>
  );
};
