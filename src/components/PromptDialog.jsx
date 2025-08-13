import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const PromptDialog = ({ isOpen, title, message, defaultValue = '', onConfirm, onCancel }) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
      // Focus the input field when the modal opens
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100); // Small delay to ensure modal is rendered
      return () => clearTimeout(timer);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(inputValue);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] p-8 rounded-xl shadow-2xl w-full max-w-md text-[var(--color-text)] border border-[var(--color-border)] transform transition-all duration-300 scale-100 opacity-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onCancel}
            className="p-2 rounded-full text-[var(--color-textSecondary)] hover:bg-[var(--color-surfaceHover)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-[var(--color-textSecondary)] mb-4">{message}</p>
        <input
          type="text"
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleConfirm();
            }
          }}
          className="w-full p-2.5 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus-[var(--color-primary)] focus:border-transparent transition-all duration-200 mb-6"
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg font-medium transition-colors bg-[var(--color-surfaceHover)] text-[var(--color-textSecondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg font-medium transition-colors bg-[var(--color-primary)] text-white hover:bg-[var(--color-primaryHover)]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptDialog;
