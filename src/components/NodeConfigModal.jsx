import React, { useState, useEffect } from 'react';
import nodeConfigSchemas from '../nodeConfigSchemas';
import { Save, X, Trash2, FileText, Terminal, Globe, BrainCircuit, Cpu, Database, Share2, GitMerge, Bot, MessageSquare, Sliders, Code, Search, File, Image, CreditCard, Rss, HardDrive, Server, GitBranch, ChevronsLeft, ChevronsRight, ChevronDown, ChevronUp, Play } from 'lucide-react'; // Import all necessary icons
import ConfirmationDialog from './ConfirmationDialog'; // Import ConfirmationDialog

// Map node types to their corresponding Lucide icons
const nodeIcons = {
  Node: Cpu,
  Flow: GitMerge,
  AsyncNode: Cpu,
  AsyncFlow: GitMerge,
  AsyncBatchNode: Cpu,
  AsyncParallelBatchNode: Cpu,
  AgentNode: Bot,
  EmbeddingNode: BrainCircuit,
  SemanticMemoryNode: Database,
  MemoryNode: Database,
  TransformNode: Sliders,
  CodeInterpreterNode: Code,
  UserInputNode: MessageSquare,
  InteractiveInputNode: MessageSquare,
  IteratorNode: Share2,
  SubFlowNode: GitMerge,
  SchedulerNode: Sliders,
  ReadFileNode: FileText,
  WriteFileNode: FileText,
  AppendFileNode: FileText,
  ListDirectoryNode: File,
  ShellCommandNode: Terminal,
  HttpRequestNode: Globe,
  DeepSeekLLMNode: BrainCircuit,
  AgentDeepSeekLLMNode: BrainCircuit,
  OpenAILLMNode: BrainCircuit,
  AgentOpenAILLMNode: BrainCircuit,
  GeminiLLMNode: BrainCircuit,
  OllamaLLMNode: BrainCircuit,
  AgentOllamaLLMNode: BrainCircuit,
  HuggingFaceLLMNode: BrainCircuit,
  AgentHuggingFaceLLMNode: BrainCircuit,
  OpenRouterLLMNode: BrainCircuit,
  AgentOpenRouterLLMNode: BrainCircuit,
  DuckDuckGoSearchNode: Search,
  GoogleSearchNode: Search,
  WebScraperNode: Globe,
  BrowserControlNode: Globe,
  WebSocketsNode: Share2,
  WebHookNode: Share2,
  DataExtractorNode: Code,
  PDFProcessorNode: File,
  SpreadsheetNode: File,
  DataValidationNode: Code,
  GitNode: GitBranch,
  GitHubNode: GitBranch,
  GISNode: Globe,
  DisplayImageNode: Image,
  ImageGalleryNode: Image,
  HardwareInteractionNode: HardDrive,
  SpeechSynthesisNode: MessageSquare,
  MultimediaProcessingNode: Server,
  RemoteExecutionNode: Server,
  SystemNotificationNode: MessageSquare,
  StripeNode: CreditCard,
  HackerNewsNode: Rss,
};


const NodeConfigModal = ({ node, onConfigChange, onClose, onDeleteNode }) => {
  const [nodeData, setNodeData] = useState(node.data);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const schema = nodeConfigSchemas[node.type];
  const NodeIcon = nodeIcons[node.type] || Cpu; // Default to Cpu icon if not found

  useEffect(() => {
    setNodeData(node.data);
  }, [node.data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNodeData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    onConfigChange(node.id, nodeData);
    onClose();
  };

  const handleDeleteClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = () => {
    onDeleteNode(node.id);
    setShowConfirmDialog(false);
    onClose(); // Close the config modal after deletion
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
  };

  if (!node) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-[var(--color-text)] border border-[var(--color-border)] transform transition-all duration-300 scale-100 opacity-100">
        {/* Modal Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-[var(--color-border)]">
          <div className="flex flex-col space-y-1">
            <div className="flex flex-col space-y-0">
              <button
                onClick={handleSave}
                className="p-2 rounded-md text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primaryHover)] transition-colors flex items-center space-x-1 group"
                aria-label="Save"
              >
                <Save className="w-4 h-4" />
                <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">Save</span>
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-2 rounded-md text-[var(--color-error)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] transition-colors flex items-center space-x-1 group"
                aria-label="Delete Node"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">Delete</span>
              </button>
              <button
                onClick={() => alert('Execute Node functionality to be implemented!')} // Placeholder for execute
                className="p-2 rounded-md text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 hover:text-[var(--color-secondary)] transition-colors flex items-center space-x-1 group"
                aria-label="Execute Node"
              >
                <Play className="w-4 h-4" /> {/* Using Play icon for execute */}
                <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">Execute</span>
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center flex-grow -mt-2"> {/* Adjust margin-top to align with buttons */}
            <NodeIcon className="w-8 h-8 text-[var(--color-primary)] mb-2" /> {/* Larger icon */}
            <h2 className="text-xl font-bold text-[var(--color-text)] text-center">{node.type}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[var(--color-textSecondary)] hover:bg-[var(--color-surfaceHover)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Dynamic Inputs */}
        <div className="space-y-5 mb-6">
          {schema && Object.entries(schema).map(([key, config]) => (
            <div key={key}>
              <label htmlFor={key} className="block text-sm font-medium text-[var(--color-textSecondary)] mb-1">
                {config.label || key}
              </label>
              {config.type === 'text' && (
                <input
                  type="text"
                  id={key}
                  name={key}
                  value={nodeData[key] || ''}
                  onChange={handleChange}
                  placeholder={config.placeholder || ''}
                  className="w-full p-2.5 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                />
              )}
              {config.type === 'number' && (
                <input
                  type="number"
                  id={key}
                  name={key}
                  value={nodeData[key] || ''}
                  onChange={handleChange}
                  placeholder={config.placeholder || ''}
                  className="w-full p-2.5 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                />
              )}
              {config.type === 'textarea' && (
                <textarea
                  id={key}
                  name={key}
                  value={nodeData[key] || ''}
                  onChange={handleChange}
                  placeholder={config.placeholder || ''}
                  rows={config.rows || 3}
                  className="w-full p-2.5 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                />
              )}
              {config.type === 'boolean' && (
                <input
                  type="checkbox"
                  id={key}
                  name={key}
                  checked={nodeData[key] || false}
                  onChange={(e) => setNodeData(prevData => ({ ...prevData, [key]: e.target.checked }))}
                  className="h-5 w-5 text-[var(--color-primary)] border-[var(--color-border)] rounded focus:ring-[var(--color-primary)] transition-all duration-200"
                />
              )}
              {config.type === 'select' && (
                <select
                  id={key}
                  name={key}
                  value={nodeData[key] || ''}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                >
                  {config.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}
              {config.type === 'json' && (
                <textarea
                  id={key}
                  name={key}
                  value={JSON.stringify(nodeData[key], null, 2) || ''}
                  onChange={(e) => {
                    try {
                      setNodeData(prevData => ({ ...prevData, [key]: JSON.parse(e.target.value) }));
                    } catch (error) {
                      console.error("Invalid JSON input:", error);
                    }
                  }}
                  rows={config.rows || 6}
                  className="w-full p-2.5 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                />
              )}
            </div>
          ))}
          {!schema && (
            <p className="text-[var(--color-textSecondary)]">No configurable parameters for this node type.</p>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmDialog}
        message="Are you sure you want to delete this node? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default NodeConfigModal;
