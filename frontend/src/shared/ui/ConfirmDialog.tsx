import type { FC } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

export interface ConfirmDialogProps {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  onConfirmar: () => void;
  onCerrar: () => void;
  cargando?: boolean;
  variante?: 'peligro' | 'primario';
}

export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  abierto,
  titulo,
  mensaje,
  textoConfirmar,
  onConfirmar,
  onCerrar,
  cargando = false,
  variante = 'peligro',
}) => (
  <Modal abierto={abierto} titulo={titulo} onCerrar={onCerrar}>
    <p className="text-sm text-slate-600">{mensaje}</p>
    <div className="mt-6 flex justify-end gap-2">
      <Button variante="secundario" onClick={onCerrar} disabled={cargando}>
        Volver
      </Button>
      <Button variante={variante} onClick={onConfirmar} cargando={cargando}>
        {textoConfirmar}
      </Button>
    </div>
  </Modal>
);
