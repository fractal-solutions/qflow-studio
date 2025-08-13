import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
} from 'react-flow-renderer';
import { Save, Play, Pause, Download, Upload } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext.jsx';
import AlertDialog from './components/AlertDialog.jsx';
import PromptDialog from './components/PromptDialog.jsx';
import Sidebar from './components/Sidebar.jsx';

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: {
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {React.createElement(nodeIcons['Node'], { size: 12 })} {/* Use a generic Node icon or specific input icon */}
          <span>Start Node</span>
        </div>
      ),
    },
    position: { x: 250, y: 25 },
    style: {
      background: 'var(--color-success)',
      color: 'white',
      border: '2px solid var(--color-success)',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '8px', // Changed to 8px
      fontWeight: '600',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
  },
];

const initialEdges = [];

let id = 2;
const getId = () => `${id++}`;

const generateRandomPort = () => {
  const minPort = 49152; //IANA registered ephemeral port range
  const maxPort = 65535;
  return Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;
};

import NodeConfigModal, { nodeIcons } from './components/NodeConfigModal.jsx';
import nodeConfigSchemas from './nodeConfigSchemas';
import CustomNode from './components/CustomNode.jsx';

const nodeTypes = {
  AgentNode: CustomNode,
  EmbeddingNode: CustomNode,
  SemanticMemoryNode: CustomNode,
  MemoryNode: CustomNode,
  TransformNode: CustomNode,
  CodeInterpreterNode: CustomNode,
  UserInputNode: CustomNode,
  InteractiveInputNode: CustomNode,
  IteratorNode: CustomNode,
  SubFlowNode: CustomNode,
  SchedulerNode: CustomNode,
  ReadFileNode: CustomNode,
  WriteFileNode: CustomNode,
  ShellCommandNode: CustomNode,
  HttpRequestNode: CustomNode,
  DeepSeekLLMNode: CustomNode,
  AgentDeepSeekLLMNode: CustomNode,
  OpenAILLMNode: CustomNode,
  AgentOpenAILLMNode: CustomNode,
  GeminiLLMNode: CustomNode,
  OllamaLLMNode: CustomNode,
  AgentOllamaLLMNode: CustomNode,
  HuggingFaceLLMNode: CustomNode,
  AgentHuggingFaceLLMNode: CustomNode,
  OpenRouterLLMNode: CustomNode,
  AgentOpenRouterLLMNode: CustomNode,
  DuckDuckGoSearchNode: CustomNode,
  GoogleSearchNode: CustomNode,
  ScrapeURLNode: CustomNode,
  BrowserControlNode: CustomNode,
  WebHookNode: CustomNode,
  AppendFileNode: CustomNode,
  ListDirectoryNode: CustomNode,
  DataExtractorNode: CustomNode,
  PDFProcessorNode: CustomNode,
  SpreadsheetNode: CustomNode,
  DataValidationNode: CustomNode,
  GISNode: CustomNode,
  DisplayImageNode: CustomNode,
  ImageGalleryNode: CustomNode,
  HardwareInteractionNode: CustomNode,
  SpeechSynthesisNode: CustomNode,
  MultimediaProcessingNode: CustomNode,
  RemoteExecutionNode: CustomNode,
  SystemNotificationNode: CustomNode,
  SharedStateReaderNode: CustomNode,
  SharedStateWriterNode: CustomNode,
  BranchNode: CustomNode,
  CustomAgentNode: (props) => <CustomNode {...props} />,
  CustomInteractiveAgent: (props) => <CustomNode {...props} />,
};

function WorkflowBuilder({ onNodeSelected, onNodeConfigChange }) {
  const { theme } = useTheme();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  const [alertInfo, setAlertInfo] = useState({ isOpen: false, message: '', title: '', type: 'info' });
  const showAlert = (title, message, type = 'info') => {
    setAlertInfo({ isOpen: true, title, message, type });
  };
  const closeAlert = () => {
    setAlertInfo({ isOpen: false, message: '', title: '', type: 'info' });
  };




  // Update refs whenever nodes or edges state changes
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Define the onInit callback here, within the WorkflowBuilder component
  const onInit = useCallback((instance) => {
    setReactFlowInstance(instance); // Store the React Flow instance in state
    instance.zoomTo(1.2); // Set the initial zoom level
  }, []);
  const [activeWebhookNodeId, setActiveWebhookNodeId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [nodeToConfigure, setNodeToConfigure] = useState(null);
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [promptDialogDefaultValue, setPromptDialogDefaultValue] = useState('');

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((node) => node.id === params.source);
      let branchName = 'default'; // Default branch name

      if (sourceNode && sourceNode.type === 'BranchNode') {
        const promptedBranchName = prompt('Enter branch name (e.g., "success", "failure", "default"): ');
        if (promptedBranchName === null) { // User cancelled
          return;
        }
        branchName = promptedBranchName || 'default';
      }

      setEdges((eds) => addEdge({
        ...params,
        animated: true,
        style: { stroke: 'var(--color-secondary)', strokeWidth: 2 },
        data: { branchName: branchName }
      }, eds));
    },
    [setEdges, nodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: {
          label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {React.createElement(nodeIcons[type] || nodeIcons['Node'], { size: 12 })} {/* Use specific icon or generic Node icon */}
              <span>{type}</span>
            </div>
          ),
          // Initialize with default values for common parameters
          // This helps ensure the data structure is preserved by React Flow
          ...(type === 'SharedStateWriterNode' && { key: '', value: '' }),
          ...(type === 'SharedStateReaderNode' && { sharedKey: '' }),
          ...(type === 'WebHookNode' && { port: generateRandomPort() }), // Assign random port for WebHookNode
          // Initialize BranchNode specific data
          ...(type === 'BranchNode' && {
            conditionSource: nodeConfigSchemas.BranchNode.conditionSource.defaultValue,
            conditionValue: nodeConfigSchemas.BranchNode.conditionValue.defaultValue,
            branches: JSON.parse(nodeConfigSchemas.BranchNode.branches.defaultValue),
          }),
        },
        style: {
            background: 'var(--color-primary)',
            color: 'white',
            border: '2px solid var(--color-primary)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '8px', // Changed to 8px
            fontWeight: '600',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );


  const onSave = useCallback(() => {
    // Get the latest nodes and edges directly from the React Flow instance
    const currentNodes = reactFlowInstance.getNodes();
    const currentEdges = reactFlowInstance.getEdges();

    const flowData = {
      nodes: currentNodes,
      edges: currentEdges,
      timestamp: new Date().toISOString(),
    };
    console.log('Saving workflow:', JSON.stringify(flowData, null, 2));
    showAlert('Success', 'Workflow saved! Check console for JSON output.', 'success');

  }, [reactFlowInstance]); // Depend on reactFlowInstance

  const onExport = useCallback(() => {
    // Set state to show the custom prompt dialog
    setShowPromptDialog(true);
    setPromptDialogDefaultValue(`qflow-workflow-${Date.now()}`);
  }, []);

  const handlePromptConfirm = useCallback((fileName) => {
    setShowPromptDialog(false); // Hide the dialog

    const currentNodes = reactFlowInstance.getNodes();
    const currentEdges = reactFlowInstance.getEdges();

    const flowData = {
      nodes: currentNodes,
      edges: currentEdges,
      timestamp: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(flowData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    let finalFileName = fileName.trim();
    if (finalFileName === '') {
      finalFileName = `qflow-workflow-${Date.now()}`;
    }
    a.download = finalFileName.endsWith('.qfw') ? finalFileName : `${finalFileName}.qfw`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showAlert('Success', 'Workflow exported successfully!', 'success');
  }, [reactFlowInstance]);

  const handlePromptCancel = useCallback(() => {
    setShowPromptDialog(false); // Hide the dialog
  }, []);

  const onImport = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedFlow = JSON.parse(e.target.result);
        if (importedFlow.nodes && importedFlow.edges) {
          const transformedNodes = importedFlow.nodes.map(node => {
            const defaultNodeStyle = {
              background: 'var(--color-primary)',
              color: 'white',
              border: '2px solid var(--color-primary)',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '8px',
              fontWeight: '600',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            };

            const inputNodeStyle = {
              ...defaultNodeStyle,
              background: 'var(--color-success)',
              border: '2px solid var(--color-success)',
            };

            const styleToApply = node.type === 'input' ? inputNodeStyle : defaultNodeStyle;

            const labelText = (typeof node.data.label === 'string')
              ? node.data.label
              : (node.data.label && node.data.label.props && Array.isArray(node.data.label.props.children) && node.data.label.props.children[1] && node.data.label.props.children[1].props)
                ? node.data.label.props.children[1].props.children
                : node.type; // Fallback to node type if label is malformed

            return {
              ...node,
              data: {
                ...node.data,
                label: (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {React.createElement(nodeIcons[node.type] || nodeIcons['Node'], { size: 12 })}
                    <span>{labelText}</span>
                  </div>
                ),
              },
              style: {
                ...node.style,
                ...styleToApply,
              },
            };
          });

          setNodes(transformedNodes);
          setEdges(importedFlow.edges);

          // Find the maximum ID among the imported nodes
          const maxId = importedFlow.nodes.reduce((max, node) => {
            const nodeIdNum = parseInt(node.id, 10);
            return isNaN(nodeIdNum) ? max : Math.max(max, nodeIdNum);
          }, 0);

          // Update the global 'id' counter
          id = maxId + 1;

          showAlert('Success', 'Workflow imported successfully!', 'success'); 
        } else {
          showAlert('Error','Invalid workflow file: Missing nodes or edges data.');
        }
      } catch (error) {
        showAlert('Error',`Error importing workflow`,error.message);
        console.error('Error','Error parsing imported workflow', error);
      }
    };
    reader.readAsText(file);
  }, [setNodes, setEdges]);

  const onRun = useCallback(async () => {
    setIsRunning(true);
    try {
      // Get the latest nodes and edges directly from the React Flow instance
      const currentNodes = reactFlowInstance.getNodes();
      const currentEdges = reactFlowInstance.getEdges();

      // Transform GISNode data before sending to backend
      const transformedNodes = currentNodes.map(node => {
        if (node.type === 'GISNode') {
          const newData = { ...node.data };
          console.log('workflow data ', newData.params.address, newData.addressSharedKey)
          newData.addressSharedKey = newData.addressSharedKey.value;
          //newData.params = {}; // Initialize params object
          if (newData.operation === 'geocode') {
            if (typeof newData.addressSharedKey === 'string' && newData.addressSharedKey.trim() !== '') { // Check for non-empty string
              // If addressSharedKey is present and not empty, the backend WorkflowExecutor will handle resolving the address from shared state.
              // We don't need to set newData.params.address here.
              // Ensure newData.address is not passed if addressSharedKey is used.
              //newData.address = newData.addressSharedKey.value;
              //delete newData.address;
            } else if (newData.params.address) {
              // If no addressSharedKey, or it's empty, but address is present, use it as a static address.
              newData.address = newData.params.address;
              delete newData.addressSharedKey;
            }
          } else if (newData.operation === 'reverse_geocode' && newData.latitude && newData.longitude) {
            newData.params.lat = newData.latitude;
            newData.params.lng = newData.longitude;
            delete newData.latitude;
            delete newData.longitude;
          }
          return { ...node, data: newData };
        }
        return node;
      });

      console.log('Frontend sending nodes:', transformedNodes); // THIS WILL APPEAR IN BROWSER CONSOLE

      const response = await fetch('http://localhost:3000/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes: transformedNodes, edges: currentEdges }),
      });
      const data = await response.json();
      if (data.success) {
        if (data.isWebhookFlow) {
          showAlert('Success', data.result, 'success'); // Display the result message from the backend
          // Update the style of the active webhook node
          setNodes((nds) =>
            nds.map((node) => {
              if (node.id === data.activeWebhookNodeId) {
                return {
                  ...node,
                  style: {
                    ...node.style,
                    border: '1px solid white', // Green border
                    boxShadow: '0 0 15px white', // White glow
                  },
                };
              }
              return node;
            })
          );
          setActiveWebhookNodeId(data.activeWebhookNodeId);
        } else {
          showAlert('Success', 'Workflow finished successfully!', 'success');
        }
      } else {
        showAlert('Error',`Workflow failed`, data.error);
      }
    } catch (error) {
      showAlert('Error',`Error running workflow`, error.message);
    } finally {
      setIsRunning(false);
    }
  }, [reactFlowInstance]); // Depend on reactFlowInstance

  const onStopWebhook = useCallback(async () => {
    if (!activeWebhookNodeId) return; // Should not happen if button is correctly conditional

    setIsRunning(true); // Indicate that an operation is in progress
    try {
      const response = await fetch('http://localhost:3000/stop-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookId: activeWebhookNodeId }),
      });
      const data = await response.json();

      if (data.success) {
        showAlert('Success', data.message, 'success');
        // Reset the style of the stopped webhook node
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === activeWebhookNodeId) {
              return {
                ...node,
                style: {
                  ...node.style,
                  border: '2px solid var(--color-primary)', // Reset to default border
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Reset to default shadow
                },
              };
            }
            return node;
          })
        );
        setActiveWebhookNodeId(null); // Clear the active webhook ID
      } else {
        showAlert('Error', `Failed to stop webhook: ${data.error}`, 'error');
      }
    } catch (error) {
      showAlert('Error', `Error stopping webhook: ${error.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  }, [activeWebhookNodeId, setNodes, showAlert]); // Dependencies

  const handleNodeClick = (event, node) => {
    setNodeToConfigure(node);
    setShowModal(true);
  };

  const handleNodeConfigChange = (nodeId, data) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          // Create a new node object with the updated data
          return {
            ...node,
            data: { ...data } // Deep copy the data object
          };
        }
        return node;
      })
    );
    // The onNodeConfigChange prop from App.jsx is not strictly needed here for data flow
    // but can be kept if App.jsx needs to react to node config changes for other reasons.
    // For now, we'll remove it as it's not used for data propagation.
    // onNodeConfigChange(nodeId, data);
  };

  const onCloseModal = () => {
    setShowModal(false);
    setNodeToConfigure(null);
  };

  const handleDeleteNode = useCallback((nodeIdToDelete) => {                     
    setNodes((nds) => nds.filter((node) => node.id !== nodeIdToDelete));             
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeIdToDelete            
            && edge.target !== nodeIdToDelete));                                               
  }, [setNodes, setEdges]);   


  return (
    <div className="h-screen flex flex-col w-full">
      {/* Toolbar */}
      <div className="bg-[var(--color-surface)] shadow-sm border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between z-10">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Workflow Builder</h2>
          <p className="text-sm text-[var(--color-textSecondary)] mt-1">Design and execute your workflows visually</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={onRun}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              isRunning && !activeWebhookNodeId // If running and not a webhook, or if it's a webhook and not active
                ? 'bg-[var(--color-error)]/10 text-[var(--color-error)] hover:bg-[var(--color-error)]/20 border border-[var(--color-error)]/20'
                : 'bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20 border border-[var(--color-success)]/20'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Stop' : 'Run'}</span>
          </button>
          {activeWebhookNodeId && ( // Conditionally render stop button for active webhook
            <button
              onClick={onStopWebhook}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isRunning
                  ? 'bg-[var(--color-error)]/10 text-[var(--color-error)] hover:bg-[var(--color-error)]/20 border border-[var(--color-error)]/20'
                  : 'bg-[var(--color-error)]/10 text-[var(--color-error)] hover:bg-[var(--color-error)]/20 border border-[var(--color-error)]/20'
              }`}
            >
              <Pause className="w-4 h-4" />
              <span>Stop Webhook</span>
            </button>
          )}
          <button
            onClick={onSave}
            className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primaryHover)] transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            <span>Save Workflow</span>
          </button>
          <button
            onClick={onExport} // New Export button
            className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-secondary)] text-white rounded-lg hover:bg-[var(--color-secondaryHover)] transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Export Workflow</span>
          </button>
          <button
            onClick={() => document.getElementById('import-workflow-input').click()} // Trigger hidden file input
            className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-tertiary)] text-white rounded-lg hover:bg-[var(--color-tertiaryHover)] transition-colors font-medium"
          >
            <Upload className="w-4 h-4" />
            <span>Import Workflow</span>
          </button>
          <input
            type="file"
            id="import-workflow-input"
            style={{ display: 'none' }} // Hide the input
            accept=".qfw"
            onChange={onImport}
          />
        </div>
      </div>

      <div className="flex flex-1 h-full">
        {/* <Sidebar /> */}
        <div
          className="flex-1 h-full"
          ref={reactFlowWrapper}
          onKeyDown={useCallback((event) => {
            if (showModal && (event.key === 'Backspace' || event.key === 'Delete')) {
              event.preventDefault();
              event.stopPropagation();
            }
          }, [showModal])}
        >
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={onInit}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={handleNodeClick}
                    onNodesDelete={useCallback((deletedNodes) => {
                      if (showModal) { // Prevent deletion if modal is open
                        return;
                      }
                      setNodes((nds) => nds.filter((node) => !deletedNodes.some((delNode) => delNode.id === node.id)));
                      setEdges((eds) => eds.filter((edge) => !deletedNodes.some((delNode) => delNode.id === edge.source || delNode.id === edge.id)));
                    }, [setNodes, setEdges, showModal])}
                    connectionLineStyle={{ stroke: 'var(--color-secondary)', strokeWidth: 2 }}
                    fitView
                >
                    <Controls className="bg-[var(--color-surface)] shadow-lg border border-[var(--color-border)]" />
                    <MiniMap
                    nodeColor={(node) => {
                        switch (node.type) {
                        case 'input':
                            return 'var(--color-success)';
                        case 'output':
                            return 'var(--color-error)';
                        default:
                            return 'var(--color-primary)';
                        }
                    }}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] shadow-lg"
                    />
                    <Background color="var(--color-border)" gap={20} />
                </ReactFlow>
            </ReactFlowProvider>
        </div>
      </div>
      {showModal && nodeToConfigure && (
        <NodeConfigModal
          node={nodeToConfigure}
          onConfigChange={handleNodeConfigChange}
          onClose={onCloseModal}
          onDeleteNode={handleDeleteNode} // Pass the new delete handler
          activeWebhookNodeId={activeWebhookNodeId} // Pass active webhook ID
          onStopWebhook={onStopWebhook} // Pass the stop webhook function
        />
      )}
      <AlertDialog
        isOpen={alertInfo.isOpen}
        title={alertInfo.title}
        message={alertInfo.message}
        type={alertInfo.type}
        onClose={closeAlert}
      />
      <PromptDialog
        isOpen={showPromptDialog}
        title="Export Workflow"
        message="Enter a filename for your workflow:"
        defaultValue={promptDialogDefaultValue}
        onConfirm={handlePromptConfirm}
        onCancel={handlePromptCancel}
      />
    </div>
  );
}

export default WorkflowBuilder;