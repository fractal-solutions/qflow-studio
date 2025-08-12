import React from 'react';
import { Handle, Position } from 'react-flow-renderer';

const CustomNode = ({ data, style, type }) => {
  // Determine if it's an 'input' node to apply specific styling
  const isInputNode = type === 'input';

  const nodeStyle = {
    background: isInputNode ? 'var(--color-success)' : 'var(--color-primary)',
    color: 'white',
    border: isInputNode ? '2px solid var(--color-success)' : '2px solid var(--color-primary)',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '8px',
    fontWeight: '600',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    ...style, // Apply any additional styles passed from the node object
  };

  return (
    <div style={nodeStyle}>
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default CustomNode;