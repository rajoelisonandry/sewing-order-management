import React from 'react';
import { FiX } from 'react-icons/fi';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  title,
  onClose,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-2xl rounded-3xl bg-white dark:bg-secondary-900 shadow-lg">
        <div className="flex items-center justify-between border-b border-secondary-200 dark:border-secondary-800 p-6">
          <h2 className="text-xl font-semibold text-primary-700 dark:text-primary-400">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-secondary-100 dark:hover:bg-secondary-800"
          >
            <FiX
              size={24}
              className="text-secondary-500 dark:text-secondary-400"
            />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
