"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/src/shared/utils";
import type { ModalId, ModalConfig, ModalContextValue, ModalOptions, ModalProps } from "../types/modal";

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

interface ModalProviderProps {
  children: React.ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modals, setModals] = useState<Map<ModalId, ModalConfig>>(new Map());

  const openModal = useCallback(
    <T = unknown>(
      id: ModalId,
      component: React.ComponentType<ModalProps<T>>,
      props?: T,
      options?: ModalOptions
    ) => {
      setModals((prev) => {
        const newModals = new Map(prev);
        newModals.set(id, {
          id,
          component: component as React.ComponentType<ModalProps<unknown>>,
          props,
          options: {
            closeOnOverlayClick: true,
            closeOnEscape: true,
            showCloseButton: true,
            size: "md",
            position: "center",
            ...options,
          },
        });
        return newModals;
      });

      // Executa callback onOpen após um pequeno delay para garantir que o modal foi renderizado
      if (options?.onOpen) {
        setTimeout(() => {
          options.onOpen?.();
        }, 0);
      }
    },
    []
  );

  const closeModal = useCallback((id: ModalId) => {
    setModals((prev) => {
      const modal = prev.get(id);
      if (modal?.options?.onClose) {
        modal.options.onClose();
      }

      const newModals = new Map(prev);
      newModals.delete(id);
      return newModals;
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModals((prev) => {
      // Executa onClose de todos os modais
      prev.forEach((modal) => {
        if (modal.options?.onClose) {
          modal.options.onClose();
        }
      });
      return new Map();
    });
  }, []);

  const isModalOpen = useCallback(
    (id: ModalId) => {
      return modals.has(id);
    },
    [modals]
  );

  const getModalData = useCallback(
    <T = unknown,>(id: ModalId): T | undefined => {
      const modal = modals.get(id);
      return modal?.props as T | undefined;
    },
    [modals]
  );

  // Fecha modal ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const openModals = Array.from(modals.values());
        const lastModal = openModals[openModals.length - 1];
        if (lastModal?.options?.closeOnEscape !== false) {
          closeModal(lastModal.id);
        }
      }
    };

    if (modals.size > 0) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [modals, closeModal]);

  const value: ModalContextValue = {
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    getModalData,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ModalRenderer modals={modals} closeModal={closeModal} />
    </ModalContext.Provider>
  );
}

// Componente que renderiza os modais
function ModalRenderer({
  modals,
  closeModal,
}: {
  modals: Map<ModalId, ModalConfig>;
  closeModal: (id: ModalId) => void;
}) {
  const modalsArray = Array.from(modals.values());
  
  return (
    <>
      {modalsArray.map((modal, index) => (
        <ModalWrapper 
          key={String(modal.id)} 
          modal={modal} 
          closeModal={closeModal}
          zIndex={50 + (index * 10)} // Cada modal empilhado tem z-index maior
        />
      ))}
    </>
  );
}

// Wrapper do modal com animações
function ModalWrapper({
  modal,
  closeModal,
  zIndex = 50,
}: {
  modal: ModalConfig;
  closeModal: (id: ModalId) => void;
  zIndex?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Animação de entrada usando requestAnimationFrame para evitar renders cascateados
    requestAnimationFrame(() => {
      setIsVisible(true);
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      closeModal(modal.id);
    }, 300);
  }, [modal.id, closeModal]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      // Não fecha se houver texto selecionado
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        return;
      }
      
      if (e.target === e.currentTarget && modal.options?.closeOnOverlayClick !== false) {
        handleClose();
      }
    },
    [handleClose, modal.options]
  );

  const position = modal.options?.position || "center";
  const size = modal.options?.size || "md";

  // Classes para tamanhos (centro)
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4",
  };

  // Classes para largura/altura (laterais)
  const sideSizeClasses = {
    sm: position === "left" || position === "right" ? "w-80" : "h-80",
    md: position === "left" || position === "right" ? "w-96" : "h-96",
    lg: position === "left" || position === "right" ? "w-[32rem]" : "h-[32rem]",
    xl: position === "left" || position === "right" ? "w-[40rem]" : "h-[40rem]",
    full: position === "left" || position === "right" ? "w-full" : "h-full",
  };

  const ModalComponent = modal.component;

  // Renderização para modais laterais (left/right)
  if (position === "left" || position === "right") {
    return (
      <div
        className={cn(
          "fixed inset-0 transition-opacity duration-300",
          isVisible && !isAnimating ? "opacity-100" : "opacity-0",
          "bg-black/50 backdrop-blur-sm",
          modal.options?.overlayClassName
        )}
        style={{ zIndex }}
        onClick={handleOverlayClick}
      >
        <div
          className={cn(
            "fixed top-0 bottom-0",
            position === "left" ? "left-0" : "right-0",
            sideSizeClasses[size],
            "transform bg-card shadow-2xl transition-transform duration-300 rounded-lg",
            isVisible && !isAnimating
              ? "translate-x-0"
              : position === "left"
              ? "-translate-x-full"
              : "translate-x-full",
            modal.options?.className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {modal.options?.showCloseButton !== false && (
            <button
              onClick={handleClose}
              className={cn(
                "absolute right-4 top-4 z-10 rounded-full p-2",
                "text-muted-foreground transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <ModalComponent
            isOpen={isVisible && !isAnimating}
            onClose={handleClose}
            data={modal.props}
          />
        </div>
      </div>
    );
  }

  // Renderização para modais top/bottom
  if (position === "top" || position === "bottom") {
    return (
      <div
        className={cn(
          "fixed inset-0 transition-opacity duration-300",
          isVisible && !isAnimating ? "opacity-100" : "opacity-0",
          "bg-black/50 backdrop-blur-sm",
          modal.options?.overlayClassName
        )}
        style={{ zIndex }}
        onClick={handleOverlayClick}
      >
        <div
          className={cn(
            "fixed left-0 right-0",
            position === "top" ? "top-0" : "bottom-0",
            sideSizeClasses[size],
            "transform bg-card shadow-2xl transition-transform duration-300 rounded-lg",
            isVisible && !isAnimating
              ? "translate-y-0"
              : position === "top"
              ? "-translate-y-full"
              : "translate-y-full",
            modal.options?.className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {modal.options?.showCloseButton !== false && (
            <button
              onClick={handleClose}
              className={cn(
                "absolute right-4 top-4 z-10 rounded-full p-2",
                "text-muted-foreground transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
              aria-label="Fechar modal"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <ModalComponent
            isOpen={isVisible && !isAnimating}
            onClose={handleClose}
            data={modal.props}
          />
        </div>
      </div>
    );
  }

  // Renderização padrão (centro)
  return (
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center p-4 transition-opacity duration-300",
        isVisible && !isAnimating ? "opacity-100" : "opacity-0",
        "bg-black/50 backdrop-blur-sm",
        modal.options?.overlayClassName
      )}
      style={{ zIndex }}
      onClick={handleOverlayClick}
    >
      <div
        className={cn(
          "relative w-full",
          sizeClasses[size],
          "transform rounded-lg bg-card shadow-xl transition-all duration-300",
          isVisible && !isAnimating
            ? "scale-100 translate-y-0"
            : "scale-95 translate-y-4",
          modal.options?.className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {modal.options?.showCloseButton !== false && (
          <button
            onClick={handleClose}
            className={cn(
              "absolute right-4 top-4 z-10 rounded-full p-2",
              "text-muted-foreground transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <ModalComponent
          isOpen={isVisible && !isAnimating}
          onClose={handleClose}
          data={modal.props}
        />
      </div>
    </div>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal deve ser usado dentro de um ModalProvider");
  }
  return context;
}