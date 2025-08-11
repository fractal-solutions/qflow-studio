import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
} from 'react-flow-renderer';
import { Save, Play, Pause } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext.jsx';
import Sidebar from './components/Sidebar.jsx';

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start Node' },
    position: { x: 250, y: 25 },
    style: {
      background: 'var(--color-success)',
      color: 'white',
      border: '2px solid var(--color-success)',
      borderRadius: '12px',
      padding: '10px',
      fontSize: '14px',
      fontWeight: '500',
    },
  },
];

const initialEdges = [];

let id = 2;
const getId = () => `${id++}`;

import NodeConfigModal from './components/NodeConfigModal.jsx';

function WorkflowBuilder({ onNodeSelected, onNodeConfigChange }) {
  const { theme } = useTheme();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [nodeToConfigure, setNodeToConfigure] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'var(--color-secondary)', strokeWidth: 2 } }, eds)),
    [setEdges]
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
        data: { label: `${type}` },
        style: {
            background: 'var(--color-primary)',
            color: 'white',
            border: '2px solid var(--color-primary)',
            borderRadius: '12px',
            padding: '10px',
            fontSize: '14px',
            fontWeight: '500',
          },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );


  const onSave = useCallback(() => {
    const flowData = {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    };
    console.log('Saving workflow:', JSON.stringify(flowData, null, 2));
    alert('Workflow saved! Check console for JSON output.');
  }, [nodes, edges]);

  const onRun = useCallback(async () => {
    setIsRunning(true);
    try {
      const response = await fetch('http://localhost:3000/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes, edges }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Workflow finished successfully!');
      } else {
        alert(`Workflow failed: ${data.error}`);
      }
    } catch (error) {
      alert(`Error running workflow: ${error.message}`);
    }
    setIsRunning(false);
  }, [nodes, edges]);

  const handleNodeClick = (event, node) => {
    setNodeToConfigure(node);
    setShowModal(true);
  };

  const handleNodeConfigChange = (nodeId, data) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          node.data = data;
        }
        return node;
      })
    );
    onNodeConfigChange(nodeId, data); // Keep this for App.jsx if it still needs to know
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
              isRunning
                ? 'bg-[var(--color-error)]/10 text-[var(--color-error)] hover:bg-[var(--color-error)]/20 border border-[var(--color-error)]/20'
                : 'bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20 border border-[var(--color-success)]/20'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isRunning ? 'Stop' : 'Run'}</span>
          </button>
          <button
            onClick={onSave}
            className="flex items-center space-x-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primaryHover)] transition-colors font-medium"
          >
            <Save className="w-4 h-4" />
            <span>Save Workflow</span>
          </button>
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
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
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
                    attributionPosition="bottom-left"
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
        />
      )}
    </div>
  );
}

export default WorkflowBuilder;