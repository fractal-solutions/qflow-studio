import React, { useState } from 'react';
import WorkflowBuilder from './WorkflowBuilder.jsx';
import ThemeSelector from './components/ThemeSelector.jsx';
import { ThemeProvider, useTheme } from './contexts/ThemeContext.jsx';
import { Settings, Key, CreditCard, User, LogOut } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import RightSidebar from './components/RightSidebar.jsx';

function App() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('workflow');
  const [user, setUser] = useState({ name: 'Demo User', email: 'demo@qflow.studio' });
  const [selectedNode, setSelectedNode] = useState(null);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [isNodeSidebarCollapsed, setIsNodeSidebarCollapsed] = useState(false);

  const handleNodeSelected = (node) => {
    setSelectedNode(node);
  };

  const handleNodeConfigChange = (nodeId, data) => {
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({ ...selectedNode, data });
    }
  };

  const toggleRightSidebar = () => {
    setIsRightSidebarCollapsed(!isRightSidebarCollapsed);
  };

  const toggleNodeSidebar = () => {
    setIsNodeSidebarCollapsed(!isNodeSidebarCollapsed);
  };

  const sidebarItems = [
    { id: 'workflow', label: 'Workflow Builder', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'apikeys', label: 'API Keys', icon: Key },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'workflow':
        return (
          <div className="flex h-full">
            <WorkflowBuilder
              onNodeSelected={handleNodeSelected}
            />
            {/* {!isRightSidebarCollapsed && (
              <RightSidebar
                selectedNode={selectedNode}
                onNodeConfigChange={handleNodeConfigChange}
                onToggle={toggleRightSidebar}
              />
            )} */}
            {!isNodeSidebarCollapsed && (
              <Sidebar onToggle={toggleNodeSidebar} isCollapsed={isNodeSidebarCollapsed} />
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-text)]">Settings</h2>
            <div className="space-y-6">
              <div className="bg-[var(--color-surface)] rounded-lg shadow p-6 border border-[var(--color-border)]">
                <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">Appearance</h3>
                <ThemeSelector />
              </div>
              <div className="bg-[var(--color-surface)] rounded-lg shadow p-6 border border-[var(--color-border)]">
                <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">Profile Settings</h3>
                <p className="text-[var(--color-textSecondary)]">Additional profile settings will be implemented here.</p>
              </div>
            </div>
          </div>
        );
      case 'apikeys':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-text)]">API Keys</h2>
            <div className="bg-[var(--color-surface)] rounded-lg shadow p-6 border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">Manage API Keys</h3>
              <p className="text-[var(--color-textSecondary)]">API key management will be implemented here.</p>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-[var(--color-text)]">Billing</h2>
            <div className="bg-[var(--color-surface)] rounded-lg shadow p-6 border border-[var(--color-border)]">
              <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">Billing Information</h3>
              <p className="text-[var(--color-textSecondary)]">Billing management will be implemented here.</p>
            </div>
          </div>
        );
      default:
        return <WorkflowBuilder />;
    }
  };

  return (
    <ThemeProvider>
      <div className="h-screen flex bg-[var(--color-background)]">
        {/* Sidebar */}
        <div className="w-64 bg-[var(--color-surface)] shadow-lg border-r border-[var(--color-border)]">
          <div className="p-6 border-b border-[var(--color-border)]">
            <h1 className="text-xl font-bold text-[var(--color-text)]">QFlow Studio</h1>
            <p className="text-sm text-[var(--color-textSecondary)] mt-1">Visual Workflow Builder</p>
          </div>
          
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">{user.name}</p>
                <p className="text-xs text-[var(--color-textSecondary)]">{user.email}</p>
              </div>
            </div>
          </div>

          <nav className="p-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20'
                      : 'text-[var(--color-textSecondary)] hover:bg-[var(--color-surfaceHover)] hover:text-[var(--color-text)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t border-[var(--color-border)]">
            <button className="w-full flex items-center space-x-3 px-4 py-3 text-[var(--color-textSecondary)] hover:bg-[var(--color-surfaceHover)] hover:text-[var(--color-text)] rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 h-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
