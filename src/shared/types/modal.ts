export type ModalId = string | number;

export interface ModalConfig<T = unknown> {
  id: ModalId;
  component: React.ComponentType<ModalProps<T>>;
  props?: T;
  options?: ModalOptions;
}

export interface ModalOptions {
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  position?: "center" | "left" | "right" | "top" | "bottom";
  className?: string;
  overlayClassName?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface ModalProps<T = unknown> {
  isOpen: boolean;
  onClose: () => void;
  data?: T;
}

export interface ModalContextValue {
  openModal: <T = unknown>(
    id: ModalId,
    component: React.ComponentType<ModalProps<T>>,
    props?: T,
    options?: ModalOptions
  ) => void;
  closeModal: (id: ModalId) => void;
  closeAllModals: () => void;
  isModalOpen: (id: ModalId) => boolean;
  getModalData: <T = unknown>(id: ModalId) => T | undefined;
}