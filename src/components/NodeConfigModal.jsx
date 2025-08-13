import React, { useState, useEffect } from 'react';
import nodeConfigSchemas from '../nodeConfigSchemas';
import { Save, Pause, X, Trash2, FileText, Terminal, Globe, BrainCircuit, Cpu, Database, Share2, GitMerge, Bot, MessageSquare, Sliders, Code, Search, File, Image, CreditCard, Rss, HardDrive, Server, GitBranch, ChevronsLeft, ChevronsRight, ChevronDown, ChevronUp, Play } from 'lucide-react'; // Import all necessary icons
import ConfirmationDialog from './ConfirmationDialog'; // Import ConfirmationDialog
import { CustomLLMNode } from '../qflowNodes/CustomLLMNode.js'; // Import CustomLLMNode to access providerConfigs

// Map node types to their corresponding Lucide icons
export const nodeIcons = {
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


const NodeConfigModal = ({ node, onConfigChange, onClose, onDeleteNode, activeWebhookNodeId, onStopWebhook }) => {
  const [nodeData, setNodeData] = useState(node.data);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [jsonErrors, setJsonErrors] = useState({});
  const [rawJsonInputs, setRawJsonInputs] = useState({}); // New state for raw JSON string inputs
  const schema = nodeConfigSchemas[node.type];
  const NodeIcon = nodeIcons[node.type] || Cpu; // Default to Cpu icon if not found

  useEffect(() => {
    let displayNodeData = { ...node.data };
    const initialRawJsonInputs = {};

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
        // Only apply static/shared wrapping to text and textarea types, and not to select types
        if ((config.type === 'text' || config.type === 'textarea') &&
            node.type !== 'CustomLLMNode' && // Exclude CustomLLMNode from this wrapping
            (displayNodeData[key] === undefined || typeof displayNodeData[key] !== 'object' || displayNodeData[key].type === undefined)) {
          displayNodeData[key] = { type: 'static', value: displayNodeData[key] || '' };
        }
        // For CustomLLMNode, ensure prompt is a simple string
        if (node.type === 'CustomLLMNode' && key === 'prompt' && typeof displayNodeData[key] !== 'string') {
          displayNodeData[key] = displayNodeData[key]?.value || '';
        }
        if (config.type === 'select' && (displayNodeData[key] === undefined || displayNodeData[key] === null)) {
          displayNodeData[key] = ''; // Ensure select fields have a default empty string value
        }
        // For JSON fields, initialize rawJsonInputs with stringified value
        if (config.type === 'json') {
          let jsonValueToDisplay = displayNodeData[key]?.value;
          // If the value is a string, try to parse it first
          if (typeof jsonValueToDisplay === 'string') {
            try {
              jsonValueToDisplay = JSON.parse(jsonValueToDisplay);
            } catch (e) {
              console.warn(`Could not parse stringified JSON for ${key} during display initialization. Using raw string.`, e);
              // If parsing fails, keep it as a string, it will be validated on save
            }
          }
          try {
            initialRawJsonInputs[key] = JSON.stringify(jsonValueToDisplay || {}, null, 2);
          } catch (e) {
            console.error(`Error stringifying JSON for ${key}:`, e);
            initialRawJsonInputs[key] = '{}'; // Fallback to empty object string
          }
        }
      });
    }

    // Special handling for CustomLLMNode to apply provider presets on initial load
    if (node.type === 'CustomLLMNode' && displayNodeData.provider) {
      const provider = displayNodeData.provider;
      const config = CustomLLMNode.providerConfigs[provider];
      if (config) {
        // Only apply if the fields are not already set by the user
        if (!displayNodeData.apiUrl) displayNodeData.apiUrl = config.apiUrl;
        if (!displayNodeData.model) displayNodeData.model = config.defaultModel;
        if (!displayNodeData.responsePath) displayNodeData.responsePath = config.responsePath;
        // For requestBody, we need to ensure it's a stringified JSON
        if (!displayNodeData.requestBody) {
          const defaultRequestBody = config.requestBody('{{prompt}}', config.defaultModel);
          initialRawJsonInputs.requestBody = JSON.stringify(defaultRequestBody, null, 2);
          displayNodeData.requestBody = defaultRequestBody; // Store as object for internal use
        }
      }
    }

    setNodeData(displayNodeData);
    setRawJsonInputs(initialRawJsonInputs); // Set raw JSON inputs
    setJsonErrors({}); // Clear JSON errors on node change
    setExecutionResult(null); // Clear previous results when node changes
  }, [node.data, node.type, schema]); // Add schema to dependency array

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`handleChange: name=${name}, value=${value}, type=${type}, checked=${checked}`);

    setNodeData(prevData => {
      const newParamValue = type === 'checkbox' ? checked : value;
      
      // Special handling for CustomLLMNode provider change
      if (node.type === 'CustomLLMNode' && name === 'provider') {
        const selectedProvider = newParamValue;
        const config = CustomLLMNode.providerConfigs[selectedProvider];
        let updatedData = { ...prevData, [name]: selectedProvider };

        if (config) {
          // Apply provider defaults
          updatedData.apiUrl = typeof config.apiUrl === 'function' ? config.apiUrl(updatedData.baseUrl || updatedData.apiKey) : config.apiUrl;
          updatedData.model = config.defaultModel;
          updatedData.responsePath = config.responsePath;
          
          // For requestBody, generate default and update rawJsonInputs
          const defaultRequestBody = config.requestBody(updatedData.prompt || '{{prompt}}', updatedData.model);
          updatedData.requestBody = defaultRequestBody;
          setRawJsonInputs(prevRaw => ({
            ...prevRaw,
            requestBody: JSON.stringify(defaultRequestBody, null, 2)
          }));
        } else {
          // Clear fields if no provider selected or provider not found
          updatedData.apiUrl = '';
          updatedData.model = '';
          updatedData.responsePath = '';
          updatedData.requestBody = {};
          setRawJsonInputs(prevRaw => ({ ...prevRaw, requestBody: '{}' }));
        }
        return updatedData;
      }

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
          [name]: type === 'number' ? Number(newParamValue) : newParamValue
        };
      }
    });
  };

  const handleSave = () => {
    let dataToSave = { ...nodeData };
    let hasJsonErrors = false;
    const currentJsonErrors = {};

    // Validate and parse JSON fields before saving
    if (schema) {
      Object.entries(schema).forEach(([key, config]) => {
        if (config.type === 'json' && nodeData[key] && nodeData[key].type === 'static') { // Use nodeData for type check
          const rawValue = rawJsonInputs[key]; // Get raw string from new state
          try {
            dataToSave[key].value = JSON.parse(rawValue); // Parse raw string
            currentJsonErrors[key] = false;
          } catch (error) {
            console.error(`Invalid JSON for field ${key}:`, error);
            console.log(`Problematic rawValue for ${key}:`, rawValue);
            console.log(`Length of rawValue:`, rawValue.length);
            
            currentJsonErrors[key] = true;
            hasJsonErrors = true;
          }
        }
      });
    }

    setJsonErrors(currentJsonErrors); // Update the state with current errors

    if (hasJsonErrors) {
      // Prevent saving if there are JSON parsing errors
      alert('Please correct invalid JSON inputs before saving.'); // Using alert for now
      return;
    }

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

  const onStopWebhookFromModal = () => {
    onStopWebhook(node.id); // Call the passed-in stop function
    onClose(); // Close the modal
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
                className="p-[1px] rounded-md text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primaryHover)] transition-colors flex items-center space-x-1 group"
                aria-label="Save"
              >
                <Save className="w-4 h-4" />
                <span className="text-xs font-medium opacity-30 group-hover:opacity-100 transition-opacity duration-200">Save</span>
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-[1px] rounded-md text-[var(--color-error)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] transition-colors flex items-center space-x-1 group"
                aria-label="Delete Node"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-xs font-medium opacity-30 group-hover:opacity-100 transition-opacity duration-200">Delete</span>
              </button>
              <button
                onClick={handleExecuteNode}
                className={`p-[1px] rounded-md text-orange hover:bg-[var(--color-success)]/10 hover:text-[var(--color-success)] transition-colors flex items-center space-x-1 group ${isExecuting ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Execute Node"
                disabled={isExecuting}
              >
                {isExecuting ? <span className="animate-spin">⚙️</span> : <Play className="w-4 h-4" />}
                <span className="text-xs font-medium opacity-30 group-hover:opacity-100 transition-opacity duration-200">{isExecuting ? 'Executing...' : 'Execute'}</span>
              </button>
              {node.type === 'WebHookNode' && node.id === activeWebhookNodeId && (
                <button
                  onClick={onStopWebhookFromModal}
                  className="p-[1px] rounded-md text-[var(--color-warning)] hover:bg-[var(--color-warning)]/10 hover:text-[var(--color-warning)] transition-colors flex items-center space-x-1 group"
                  aria-label="Stop Webhook"
                >
                  <Pause className="w-4 h-4" />
                  <span className="text-xs font-medium opacity-30 group-hover:opacity-100 transition-opacity duration-200">Stop Webhook</span>
                </button>
              )}
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
                <>
                  {node.type === 'CustomLLMNode' && ['apiUrl', 'apiKey', 'model', 'prompt', 'responsePath', 'baseUrl'].includes(key) ? (
                    <input
                      type="text"
                      id={key}
                      name={key}
                      value={nodeData[key] || ''}
                      onChange={handleChange}
                      placeholder={config.placeholder || ''}
                      className="w-full p-2.5 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                    />
                  ) : (
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
                </>
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
                <>
                  {node.type === 'CustomLLMNode' && key === 'prompt' ? (
                    <textarea
                      id={key}
                      name={key}
                      value={nodeData[key] || ''}
                      onChange={handleChange}
                      placeholder={config.placeholder || ''}
                      rows={config.rows || 3}
                      className="w-full p-2.5 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                    />
                  ) : (
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
                </>
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
                <>
                  {node.type === 'CustomLLMNode' && key === 'requestBody' ? (
                    <textarea
                      id={key}
                      name={key}
                      value={rawJsonInputs[key] || ''} // Use rawJsonInputs for display
                      onChange={(e) => {
                        setRawJsonInputs(prev => ({ ...prev, [key]: e.target.value })); // Update raw input
                        setJsonErrors(prevErrors => ({ ...prevErrors, [key]: false })); // Clear error on typing
                        try {
                          setNodeData(prevData => ({ ...prevData, [key]: JSON.parse(e.target.value) })); // Parse and update nodeData
                        } catch (error) {
                          // If JSON is invalid, nodeData[key] will remain the old valid object or undefined
                          // The jsonErrors state will handle displaying the error to the user
                        }
                      }}
                      rows={config.rows || 6}
                      className="w-full p-2.5 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
                    />
                  ) : (
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
                          value={rawJsonInputs[key] || ''} // Use rawJsonInputs for display
                          onChange={(e) => {
                            setRawJsonInputs(prev => ({ ...prev, [key]: e.target.value })); // Update raw input
                            setJsonErrors(prevErrors => ({ ...prevErrors, [key]: false })); // Clear error on typing
                          }}
                          rows={config.rows || 6}
                          className="w-full p-2.5 border border-[var(--color-border)] rounded-md bg-[var(--color-background)] text-[var(--color-text)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all duration-200"
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
                      {jsonErrors[key] && (
                        <p className="text-red-500 text-sm mt-1">Invalid JSON format. Please correct it.</p>
                      )}
                    </div>
                  )}
                </>
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