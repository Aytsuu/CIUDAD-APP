import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 h-screen w-screen" // Fixed position relative to viewport
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-gray-500/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container - centers content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Modal Content */}
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
