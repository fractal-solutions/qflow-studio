import React from 'react';
import ThemeSelector from './ThemeSelector.jsx';
import NodeConfigPanel from './NodeConfigPanel.jsx';
import { ChevronsLeft } from 'lucide-react';

const RightSidebar = ({ selectedNode, onNodeConfigChange, onToggle }) => {
  return (
    <aside className="w-72 bg-[var(--color-surface)] p-4 border-l border-[var(--color-border)] flex flex-col space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Settings</h3>
            <button onClick={onToggle} className="text-[var(--color-textSecondary)] hover:text-[var(--color-text)]">
                <ChevronsLeft className="w-5 h-5" />
            </button>
        </div>
      <ThemeSelector />
      <div className="flex-grow border-t border-[var(--color-border)] pt-4">
        <NodeConfigPanel
          selectedNode={selectedNode}
          onNodeConfigChange={onNodeConfigChange}
        />
      </div>
    </aside>
  );
};

export default RightSidebar;
