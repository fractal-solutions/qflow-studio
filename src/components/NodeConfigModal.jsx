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
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const schema = nodeConfigSchemas[node.type];
  const NodeIcon = nodeIcons[node.type] || Cpu; // Default to Cpu icon if not found

  useEffect(() => {
    let displayNodeData = { ...node.data };
    // If it's a GISNode, flatten the 'params' object for display in the form
    if (node.type === 'GISNode') {
      // Handle address for GISNode
      if (typeof node.data.addressSharedKey === 'string' && node.data.addressSharedKey.trim() !== '') {
        displayNodeData.address = { type: 'shared', value: node.data.addressSharedKey };
      } else if (node.data.params && node.data.params.address !== undefined) {
        displayNodeData.address = { type: 'static', value: node.data.params.address };
      } else {
        displayNodeData.address = { type: 'static', value: '' }; // Default to static empty
      }

      // Handle latitude and longitude for GISNode (assuming they are always static for now)
      if (node.data.params && node.data.params.lat !== undefined) {
        displayNodeData.latitude = { type: 'static', value: node.data.params.lat };
      } else {
        displayNodeData.latitude = { type: 'static', value: '' };
      }
      if (node.data.params && node.data.params.lng !== undefined) {
        displayNodeData.longitude = { type: 'static', value: node.data.params.lng };
      } else {
        displayNodeData.longitude = { type: 'static', value: '' };
      }
    }

    // Initialize parameters that can be sourced from shared state with default structure
    // This prevents errors when accessing .type on undefined
    if (schema) { // Ensure schema exists for the node type
      Object.entries(schema).forEach(([key, config]) => {
        if ((config.type === 'text' || config.type === 'textarea' || config.type === 'number') &&
            (displayNodeData[key] === undefined || typeof displayNodeData[key] !== 'object' || displayNodeData[key].type === undefined)) {
          displayNodeData[key] = { type: 'static', value: displayNodeData[key] || '' };
        }
      });
    }

    setNodeData(displayNodeData);
    setExecutionResult(null); // Clear previous results when node changes
  }, [node.data, node.type, schema]); // Add schema to dependency array

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setNodeData(prevData => {
      const newParamValue = type === 'checkbox' ? checked : value;
      
      // For parameters that can be sourced from shared state
      if (name.endsWith('_sourceType')) {
        const paramName = name.replace('_sourceType', '');
        const newSourceType = newParamValue;
        return {
          ...prevData,
          [paramName]: {
            ...prevData[paramName],
            type: newSourceType,
            // Reset value based on new source type
            value: newSourceType === 'static' ? (prevData[paramName]?.value || '') : (prevData[paramName]?.value || '')
          }
        };
      } else if (name.endsWith('_sharedKey')) {
        const paramName = name.replace('_sharedKey', '');
        return {
          ...prevData,
          [paramName]: {
            ...prevData[paramName],
            value: newParamValue,
            type: 'shared' // Explicitly set type to 'shared'
          }
        };
      } else if (name.endsWith('_staticValue')) {
        const paramName = name.replace('_staticValue', '');
        return {
          ...prevData,
          [paramName]: {
            ...prevData[paramName],
            value: newParamValue,
            type: 'static' // Explicitly set type to 'static'
          }
        };
      } else {
        // For other types (number, select, json, boolean directly)
        return {
          ...prevData,
          [name]: newParamValue
        };
      }
    });
  };

  const handleSave = () => {
    let dataToSave = { ...nodeData };
    if (node.type === 'GISNode') {
      dataToSave.params = {};
      if (nodeData.operation === 'geocode' && nodeData.address) {
        console.log('node data pre save: ',nodeData)
        dataToSave.params.address = nodeData.address.value;
        delete dataToSave.address; // Remove the flat address
      } else if (nodeData.operation === 'reverse_geocode' && nodeData.latitude && nodeData.longitude) {
        dataToSave.params.lat = nodeData.latitude.value;
        dataToSave.params.lng = nodeData.longitude.value;
        delete dataToSave.latitude; // Remove flat latitude
        delete dataToSave.longitude; // Remove flat longitude
      }
    }
    onConfigChange(node.id, dataToSave);
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

  const handleExecuteNode = async () => {
    setIsExecuting(true);
    setExecutionResult(null); // Clear previous results

    let dataToSend = { ...nodeData };
    if (node.type === 'GISNode') {
      dataToSend.params = {};
      if (dataToSend.operation === 'geocode' && dataToSend.address) {
        dataToSend.params.address = dataToSend.address.value;
        delete dataToSend.address; // Remove the flat address
      } else if (dataToSend.operation === 'reverse_geocode' && dataToSend.latitude && dataToSend.longitude) {
        dataToSend.params.lat = dataToSend.latitude.value;
        dataToSend.params.lng = dataToSend.longitude.value;
        delete dataToSend.latitude; // Remove flat latitude
        delete dataToSend.longitude; // Remove flat longitude
      }
    }

    try {
      console.log('sent: ', dataToSend)
      console.log(nodeData)
      const response = await fetch('http://localhost:3000/execute-node', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodeData: { type: node.type, data: dataToSend } }),
      });
      const result = await response.json();
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({ success: false, error: error.message });
    } finally {
      setIsExecuting(false);
    }
  };

  if (!node) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] backdrop-blur-sm">
      <div className="bg-[var(--color-surface)] p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-[var(--color-text)] border border-[var(--color-border)] transform transition-all duration-300 scale-100 opacity-100">
        {/* Modal Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-[var(--color-border)]">
          <div className="flex flex-col space-y-[-2]">
            <div className="flex items-left flex-col">
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
                onClick={handleExecuteNode}
                className={`p-2 rounded-md text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 hover:text-[var(--color-secondary)] transition-colors flex items-center space-x-1 group ${isExecuting ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Execute Node"
                disabled={isExecuting}
              >
                {isExecuting ? <span className="animate-spin">⚙️</span> : <Play className="w-4 h-4" />}
                <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">{isExecuting ? 'Executing...' : 'Execute'}</span>
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center flex-grow -mt-2"> {/* Adjust margin-top to align with buttons */}
            <NodeIcon className="w-8 h-8 text-[var(--color-primary)] mb-2" /> {/* Larger icon */}
            <h2 className="text-lg font-bold text-[var(--color-text)] text-center">{node.type}</h2>
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
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-[var(--color-primary)]"
                        name={`${key}_sourceType`}
                        value="static"
                        checked={(!nodeData[key] || nodeData[key].type === 'static')}
                        onChange={handleChange}
                      />
                      <span className="ml-2 text-sm text-[var(--color-textSecondary)]">Static Value</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-[var(--color-primary)]"
                        name={`${key}_sourceType`}
                        value="shared"
                        checked={nodeData[key]?.type === 'shared'}
                        onChange={handleChange}
                      />
                      <span className="ml-2 text-sm text-[var(--color-textSecondary)]">From Shared State</span>
                    </label>
                  </div>
                  {(!nodeData[key] || nodeData[key].type === 'static') && (
                    <input
                      type="text"
                      id={`${key}_staticValue`}
                      name={`${key}_staticValue`}
                      value={nodeData[key]?.value || ''}
                      onChange={handleChange}
                      placeholder={config.placeholder || ''}
                      className="w-full p-2.5 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                    />
                  )}
                  {nodeData[key]?.type === 'shared' && (
                    <input
                      type="text"
                      id={`${key}_sharedKey`}
                      name={`${key}_sharedKey`}
                      value={nodeData[key]?.value || ''}
                      onChange={handleChange}
                      placeholder="e.g., my_data.result or apiResponse.body"
                      className="w-full p-2.5 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                    />
                  )}
                </div>
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
                <div className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-[var(--color-primary)]"
                        name={`${key}_sourceType`}
                        value="static"
                        checked={(!nodeData[key] || nodeData[key].type === 'static')}
                        onChange={handleChange}
                      />
                      <span className="ml-2 text-sm text-[var(--color-textSecondary)]">Static Value</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-[var(--color-primary)]"
                        name={`${key}_sourceType`}
                        value="shared"
                        checked={nodeData[key]?.type === 'shared'}
                        onChange={handleChange}
                      />
                      <span className="ml-2 text-sm text-[var(--color-textSecondary)]">From Shared State</span>
                    </label>
                  </div>
                  {(!nodeData[key] || nodeData[key].type === 'static') && (
                    <textarea
                      id={`${key}_staticValue`}
                      name={`${key}_staticValue`}
                      value={nodeData[key]?.value || ''}
                      onChange={handleChange}
                      placeholder={config.placeholder || ''}
                      rows={config.rows || 3}
                      className="w-full p-2.5 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                    />
                  )}
                  {nodeData[key]?.type === 'shared' && (
                    <input
                      type="text"
                      id={`${key}_sharedKey`}
                      name={`${key}_sharedKey`}
                      value={nodeData[key]?.value || ''}
                      onChange={handleChange}
                      placeholder="e.g., my_data.result or apiResponse.body"
                      className="w-full p-2.5 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                    />
                  )}
                </div>
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

        {/* Execution Result Display */}
        {executionResult && (
          <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
            <h3 className="text-lg font-bold mb-2 text-[var(--color-text)]">Execution Result:</h3>
            <pre className={`p-3 rounded-md text-sm overflow-x-auto ${executionResult.success ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-error)]/10 text-[var(--color-error)]'}`}>
              <code>{JSON.stringify(executionResult.result || executionResult.error, null, 2)}</code>
            </pre>
          </div>
        )}

        {/* Output to Shared Configuration */}
        <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
          <h3 className="text-lg font-bold mb-2 text-[var(--color-text)]">Output to Shared State</h3>
          <p className="text-sm text-[var(--color-textSecondary)] mb-3">Specify a key to store this node's output in the shared state.</p>
          <input
            type="text"
            id="outputToSharedKey"
            name="outputToSharedKey"
            value={nodeData.outputToSharedKey || ''}
            onChange={handleChange}
            placeholder="e.g., my_node_output"
            className="w-full p-2.5 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
          />
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

