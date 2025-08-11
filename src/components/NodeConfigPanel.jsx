import React from 'react';
import { nodeConfig } from '../nodeConfig.js';

const NodeConfigPanel = ({ selectedNode, onNodeConfigChange }) => {
  if (!selectedNode) {
    return (
      <div className="p-4 text-sm text-[var(--color-textMuted)]">
        Select a node to configure its parameters.
      </div>
    );
  }

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    onNodeConfigChange(selectedNode.id, { ...selectedNode.data, [name]: newValue });
  };

  const config = nodeConfig[selectedNode.type];

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold text-[var(--color-text)]">{selectedNode.data.label || selectedNode.type}</h3>
      
      {config && config.fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-[var(--color-textSecondary)]">{field.label}</label>
          {field.type === 'text' && (
            <input
              type="text"
              name={field.name}
              id={field.name}
              value={selectedNode.data[field.name] || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 bg-[var(--color-surfaceHover)] border border-[var(--color-border)] rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          )}
          {field.type === 'textarea' && (
            <textarea
              name={field.name}
              id={field.name}
              value={selectedNode.data[field.name] || ''}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-[var(--color-surfaceHover)] border border-[var(--color-border)] rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          )}
          {field.type === 'select' && (
            <select
              name={field.name}
              id={field.name}
              value={selectedNode.data[field.name] || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 bg-[var(--color-surfaceHover)] border border-[var(--color-border)] rounded-md text-sm shadow-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              {field.options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
};

export default NodeConfigPanel;
