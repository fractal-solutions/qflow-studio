import React from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const AlertDialog = ({ isOpen, message, title, type, onClose }) => {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle className="w-8 h-8 text-[var(--color-success)] flex-shrink-0" />,
    error: <AlertTriangle className="w-8 h-8 text-[var(--color-error)] flex-shrink-0" />,
    info: <Info className="w-8 h-8 text-[var(--color-info)] flex-shrink-0" />,
  };

  const Icon = icons[type] || icons.info;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000]">
      <div className="bg-[var(--color-surface)] p-8 rounded-xl shadow-2xl w-full max-w-md text-[var(--color-text)] border border-[var(--color-border)]">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--color-border)]">
          <h3 className="text-xl font-bold text-[var(--color-text)]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[var(--color-textSecondary)] hover:bg-[var(--color-surfaceHover)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          {Icon}
          <p className="text-[var(--color-textSecondary)] text-lg">{message}</p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primaryHover)] transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
