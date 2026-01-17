"use client";

import { ModalProps } from "../../types/modal";
import { useModal } from "../../context/modal-context";

interface NestedModalData {
  level: number;
  title: string;
  message: string;
}

export function NestedModal({ onClose, data }: ModalProps<NestedModalData>) {
  const { openModal } = useModal();

  if (!data) return null;

  const handleOpenNested = () => {
    openModal(
      `nested-modal-${data.level + 1}`,
      NestedModal,
      {
        level: data.level + 1,
        title: `Modal Nível ${data.level + 1}`,
        message: `Este é um modal que foi aberto a partir de outro modal! Você pode abrir quantos quiser empilhados.`,
      },
      {
        size: "md",
        onOpen: () => console.log(`Modal nível ${data.level + 1} aberto!`),
        onClose: () => console.log(`Modal nível ${data.level + 1} fechado!`),
      }
    );
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {data.title}
        </h2>
        <span className="rounded-full bg-[#d2e5ff] px-3 py-1 text-sm font-semibold text-[#232f63]">
          Nível {data.level}
        </span>
      </div>
      <p className="mb-6 text-muted-foreground">{data.message}</p>

      <div className="mb-6 rounded-lg bg-muted p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Dica:</strong> Você pode abrir outro modal a partir deste! Cada modal empilhado terá um z-index maior e aparecerá por cima.
        </p>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg bg-secondary px-4 py-2 text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          Fechar Este
        </button>
        <button
          onClick={handleOpenNested}
          className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Abrir Modal em Cima
        </button>
      </div>
    </div>
  );
}


