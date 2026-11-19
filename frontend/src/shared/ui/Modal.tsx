import type { FC, ReactNode } from 'react';

export interface ModalProps {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}

export const Modal: FC<ModalProps> = ({ abierto, titulo, onCerrar, children }) => {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button type="button" aria-label="Cerrar" onClick={onCerrar} className="text-xl text-slate-500">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
