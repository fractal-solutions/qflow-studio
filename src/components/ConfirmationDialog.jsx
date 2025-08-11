import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmationDialog = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000]">
      <div className="bg-[var(--color-surface)] p-8 rounded-xl shadow-2xl w-full max-w-md text-[var(--color-text)] border border-[var(--color-border)]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--color-border)]">
          <h3 className="text-xl font-bold text-[var(--color-text)]">Confirm Action</h3>
          <button
            onClick={onCancel}
            className="p-1 rounded-full text-[var(--color-textSecondary)] hover:bg-[var(--color-surfaceHover)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex items-center space-x-4 mb-6">
          <AlertTriangle className="w-8 h-8 text-[var(--color-warning)] flex-shrink-0" />
          <p className="text-[var(--color-textSecondary)] text-lg">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg bg-[var(--color-surfaceHover)] text-[var(--color-text)] hover:bg-[var(--color-border)] transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg bg-[var(--color-error)] text-white hover:bg-[var(--color-error)]/80 transition-colors font-medium"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
