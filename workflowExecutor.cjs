import { Node, Flow, AsyncNode, AsyncFlow, AsyncBatchNode, AsyncParallelBatchNode } from '@fractal-solutions/qflow';
import { AgentNode, EmbeddingNode, SemanticMemoryNode, MemoryNode, TransformNode, CodeInterpreterNode, UserInputNode, InteractiveInputNode, IteratorNode, SubFlowNode, SchedulerNode, ReadFileNode, WriteFileNode, HttpRequestNode, DeepSeekLLMNode, AgentDeepSeekLLMNode, OpenAILLMNode, AgentOpenAILLMNode, GeminiLLMNode, OllamaLLMNode, AgentOllamaLLMNode, HuggingFaceLLMNode, AgentHuggingFaceLLMNode, OpenRouterLLMNode, AgentOpenRouterLLMNode, DuckDuckGoSearchNode, GoogleSearchNode, ScrapeURLNode, BrowserControlNode, WebHookNode, AppendFileNode, ListDirectoryNode, DataExtractorNode, PDFProcessorNode, SpreadsheetNode, DataValidationNode, GISNode, DisplayImageNode, ImageGalleryNode, HardwareInteractionNode, SpeechSynthesisNode, MultimediaProcessingNode, RemoteExecutionNode } from '@fractal-solutions/qflow/nodes';
import { ShellCommandNode, SystemNotificationNode } from './src/qflowNodes/custom';
import { SharedStateReaderNode } from './src/qflowNodes/SharedStateReaderNode.js';
import { SharedStateWriterNode } from './src/qflowNodes/SharedStateWriterNode.js';
import { BranchNode } from './src/qflowNodes/BranchNode.js';
import { CustomLLMNode } from './src/qflowNodes/CustomLLMNode.js';
import { CustomAgentNode } from './src/qflowNodes/CustomAgentNode.js';
import { CustomInteractiveAgent } from './src/qflowNodes/CustomInteractiveAgent.js';
import { registerWebhook } from './webhookRegistry.js';
import crypto from 'crypto';

const activeWorkflows = new Map();


// Helper function to get a nested property from an object
const getNestedProperty = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// Helper function to resolve a parameter based on its source type (static or shared)
const resolveParameter = (paramConfig, shared) => {
  if (!paramConfig || typeof paramConfig !== 'object' || !paramConfig.type) {
    // If it's not a structured parameter, treat it as a static value directly
    return paramConfig;
  }

  switch (paramConfig.type) {
    case 'static':
      return paramConfig.value;
    case 'shared':
      // DO NOT RESOLVE SHARED PARAMETERS HERE. Pass them through as is.
      return paramConfig; // Return the structured object
    default:
      return undefined; // Or throw an error for unknown types
  }
};

// Helper function to resolve all structured parameters on a qflow node instance
const resolveNodeParameters = (nodeInstance, shared) => {
  const resolvedParams = {};
  for (const key in nodeInstance.params) {
    const paramConfig = nodeInstance.params[key];
    if (paramConfig && typeof paramConfig === 'object' && paramConfig.type) {
      // This is a structured parameter, resolve it
      let resolvedValue; // Declare resolvedValue here

      if (paramConfig.type === 'static') {
        resolvedValue = paramConfig.value;
      } else if (paramConfig.type === 'shared') {
        resolvedValue = getNestedProperty(shared, paramConfig.value);
        // Provide an empty string if the shared value is undefined or null
        resolvedValue = resolvedValue !== undefined && resolvedValue !== null ? resolvedValue : '';
      }
      resolvedParams[key] = resolvedValue; // Assign resolvedValue here
    } else {
      // Not a structured parameter, keep as is
      resolvedParams[key] = paramConfig;
    }
  }
  return resolvedParams;
};

const extractLabel = (label) => {
	if (typeof label === 'string') {
	  return label;
	}
	if (typeof label === 'object' && label !== null && label.props && label.props.children) {
	  const children = Array.isArray(label.props.children) ? label.props.children : [label.props.children];
	  const span = children.find(child => child.type === 'span');
	  if (span && span.props && typeof span.props.children === 'string') {
		return span.props.children;
	  }
	}
	return 'default'; // fallback
  };

const nodeMap = {
  Node,
  Flow,
  AsyncNode,
  AsyncFlow,
  AsyncBatchNode,
  AsyncParallelBatchNode,
  AgentNode,
  EmbeddingNode,
  SemanticMemoryNode,
  MemoryNode,
  TransformNode,
  CodeInterpreterNode,
  UserInputNode,
  InteractiveInputNode,
  IteratorNode,
  SubFlowNode,
  SchedulerNode,
  ReadFileNode,
  WriteFileNode,
  ShellCommandNode,
  HttpRequestNode,
  DeepSeekLLMNode,
  AgentDeepSeekLLMNode,
  OpenAILLMNode,
  AgentOpenAILLMNode,
  GeminiLLMNode,
  OllamaLLMNode,
  AgentOllamaLLMNode,
  HuggingFaceLLMNode,
  AgentHuggingFaceLLMNode,
  OpenRouterLLMNode,
  AgentOpenRouterLLMNode,
  DuckDuckGoSearchNode,
  GoogleSearchNode,
  ScrapeURLNode,
  BrowserControlNode,
  WebHookNode,
  AppendFileNode,
  ListDirectoryNode,
  DataExtractorNode,
  PDFProcessorNode,
  SpreadsheetNode,
  DataValidationNode,
  GISNode,
  DisplayImageNode,
  ImageGalleryNode,
  HardwareInteractionNode,
  SpeechSynthesisNode,
  MultimediaProcessingNode,
  RemoteExecutionNode,
  SystemNotificationNode,
  SharedStateReaderNode,
  SharedStateWriterNode,
  BranchNode,
  CustomLLMNode,
  CustomAgentNode,
  CustomInteractiveAgent,
};

export const executeWorkflow = async (nodes, edges, clients, workflowId) => {
  const log = (message) => {
    if (clients && clients.has(workflowId)) {
      console.log(`WorkflowExecutor: Sending log to client for workflow ${workflowId}: ${message}`);
      clients.get(workflowId).send(JSON.stringify({ type: 'log', message }));
    } else {
      console.log(`WorkflowExecutor: No client found for workflow ${workflowId}. Log: ${message}`);
    }
  };

  log('Workflow execution started.');

  console.log('WorkflowExecutor: Received nodes:', nodes);
  console.log('WorkflowExecutor: Received edges:', edges);
  if (!nodes || nodes.length === 0) {
    console.error('No nodes to execute.');
    return { success: false, error: 'No nodes to execute.' };
  }

  // Add this console.log block
  nodes.forEach(node => {
    if (node.type === 'BranchNode') {
      console.log(`--- Debugging BranchNode Data ---`);
      console.log(`BranchNode ${node.id} - node.data.branches type: ${typeof node.data.branches}`);
      console.log(`BranchNode ${node.id} - node.data.branches value:`, node.data.branches);
      console.log(`BranchNode ${node.id} - node.data.conditionValue type: ${typeof node.data.conditionValue}`);
      console.log(`BranchNode ${node.id} - node.data.conditionValue value:`, node.data.conditionValue);
      console.log(`--- End Debugging BranchNode Data ---`);
    }
  });

  const flowNodes = {};
  // Instantiate all qflow nodes that are not of type 'input'
  nodes.forEach(node => { // Iterate over all nodes, not just qflowNodes
    if (node.type === 'input') {
      // The 'input' node is a React Flow visual element, not a Qflow Node.
      // We don't instantiate a Qflow Node for it, but its ID can be a source.
      return;
    }

    const NodeClass = nodeMap[node.type];
      if (NodeClass) {
        const flowNode = new NodeClass();
        if (node.type === 'CustomInteractiveAgent') {
          flowNode.setLogFunction(log);
        }
      flowNode.id = node.id;
      flowNode.type = node.type;
      // Store original structured parameters for potential later use (e.g., saving back to UI)
      flowNode._originalParams = node.data;

      // Resolve parameters for initial setParams
      const resolvedNodeData = {};
      for (const key in node.data) {
		if (key === 'label') {
			resolvedNodeData[key] = extractLabel(node.data[key]);
		} else {
            const paramValue = node.data[key];
            // If the parameter is a structured object from NodeConfigModal (type: 'static' or 'shared')
            if (paramValue && typeof paramValue === 'object' && paramValue.type) {
                if (paramValue.type === 'static') {
                    resolvedNodeData[key] = paramValue.value; // Unwrap static value
                } else if (paramValue.type === 'shared') {
                    // For shared, we might need to resolve it later, or pass the structure
                    // For now, let's pass the structure, and resolveNodeParameters will handle it.
                    resolvedNodeData[key] = paramValue;
                }
            } else {
                // If it's not a structured parameter (e.g., direct string, number, array)
                resolvedNodeData[key] = paramValue;
            }
		}
      }
      flowNode.setParams(resolvedNodeData); // This will set flowNode.params = resolvedNodeData

      // --- START OF BRANCHNODE SPECIFIC ASSIGNMENT ---
      if (node.type === 'BranchNode') {
        // These properties are now correctly unwrapped in resolvedNodeData
        flowNode.conditionSource = resolvedNodeData.conditionSource;
        flowNode.conditionValue = resolvedNodeData.conditionValue;
        if (resolvedNodeData.branches && Array.isArray(resolvedNodeData.branches.value)) {
          flowNode.branches = resolvedNodeData.branches.value;
        } else {
          flowNode.branches = resolvedNodeData.branches;
        }
      }
      // --- END OF BRANCHNODE SPECIFIC ASSIGNMENT ---

      // Store original prepAsync and prep methods
      const originalPrepAsync = flowNode.prepAsync;
      const originalPrep = flowNode.prep;

      // Wrap prepAsync to resolve parameters before execution
      flowNode.prepAsync = async (shared) => {
        const currentResolvedParams = resolveNodeParameters(flowNode, shared);

        // --- START OF PATCH FOR RESOLVING GISNode addressSharedKey ---
        if (flowNode.params.label === 'GISNode' && currentResolvedParams.addressSharedKey !== undefined) {
            const resolvedSharedAddress = getNestedProperty(shared, currentResolvedParams.addressSharedKey);
            if (resolvedSharedAddress !== undefined) {
                currentResolvedParams.address = resolvedSharedAddress; // Overwrite 'address' with resolved shared value
            }
            delete currentResolvedParams.addressSharedKey; // Remove the key after resolution
        }
        // --- END OF PATCH FOR RESOLVING GISNode addressSharedKey ---

        // Special handling for GISNode to nest operation-specific parameters under 'params'
        if (flowNode.params.label === 'GISNode') { // Corrected condition
          const gisParams = {};
          
          // If address is present (either static or resolved from shared state by resolveNodeParameters)
          if (currentResolvedParams.address !== undefined) {
            gisParams.address = currentResolvedParams.address;
            delete currentResolvedParams.address;
          }
          // addressSharedKey is already resolved into currentResolvedParams.address by resolveNodeParameters
          // So, we don't need to explicitly handle addressSharedKey here.
          // delete currentResolvedParams.addressSharedKey; // This line is now redundant due to the patch above

          if (currentResolvedParams.latitude !== undefined) {
            gisParams.latitude = currentResolvedParams.latitude;
            delete currentResolvedParams.latitude;
          }
          if (currentResolvedParams.longitude !== undefined) {
            gisParams.longitude = currentResolvedParams.longitude;
            delete currentResolvedParams.longitude;
          }
          if (Object.keys(gisParams).length > 0) {
            currentResolvedParams.params = gisParams;
          }
        }

        // Permanently update flowNode.params with resolved values
        flowNode.params = currentResolvedParams;

        console.log(`WorkflowExecutor: ${flowNode.params.label} prepAsync - this.params before originalPrepAsync/execAsync:`, flowNode.params);

        let prepResult = currentResolvedParams; // Initialize prepResult with resolved params
        if (originalPrepAsync) {
          // If original prepAsync exists, call it.
          // If it returns something, merge it with currentResolvedParams.
          const originalResult = await originalPrepAsync.call(flowNode, shared);
          if (originalResult && typeof originalResult === 'object') {
            prepResult = { ...currentResolvedParams, ...originalResult };
          } else if (originalResult !== undefined) {
            // If originalPrepAsync returns a non-object, prioritize it if not undefined
            prepResult = originalResult;
          }
        }

        return prepResult;
      };

      // Wrap prep for synchronous nodes
      flowNode.prep = (shared) => {
        const currentResolvedParams = resolveNodeParameters(flowNode, shared);
        
        // Permanently update flowNode.params with resolved values
        flowNode.params = currentResolvedParams;

        let prepResult;
        if (originalPrep) {
          prepResult = originalPrep.call(flowNode, shared);
        } else {
          prepResult = currentResolvedParams;
        }

        return prepResult;
      };

      // Implement generic output mapping to shared state
      if (node.data.outputToSharedKey) {
        const originalPostAsync = flowNode.postAsync; // Store original postAsync
        const originalPost = flowNode.post; // Store original post
        const outputKey = node.data.outputToSharedKey;

        // Wrap postAsync for AsyncNodes
        flowNode.postAsync = async (shared, prepRes, execRes) => {
          shared[outputKey] = execRes; // Store execRes in shared state
          console.log(`WorkflowExecutor: Stored output of ${flowNode.params.label} in shared.${outputKey}:`, execRes);
          if (originalPostAsync) {
            return await originalPostAsync.call(flowNode, shared, prepRes, execRes);
          } else {
            return execRes;
          }
        };

        // Wrap post for synchronous Nodes (if applicable)
        flowNode.post = (shared, prepRes, execRes) => {
          shared[outputKey] = execRes; // Store execRes in shared state
          console.log(`WorkflowExecutor: Stored output of ${flowNode.params.label} in shared.${outputKey}:`, execRes);
          if (originalPost) {
            return originalPost.call(flowNode, shared, prepRes, execRes);
          } else {
            return execRes;
          }
        };
      }

      flowNodes[node.id] = flowNode;
    } else {
        console.warn(`Node type ${node.type} not found in nodeMap. Skipping instantiation.`);
    }
  });

  // Connect qflow nodes based on edges
  // Only iterate over edges where the source is an instantiated Qflow node
  edges.filter(edge => flowNodes[edge.source]).forEach(edge => { // <--- NEW FILTER
    const sourceNode = flowNodes[edge.source];
    const targetNode = flowNodes[edge.target]; // targetNode might still be undefined if it's an output node

    if (sourceNode && targetNode) { // Ensure targetNode is also instantiated
      const branchName = edge.data && edge.data.branchName ? edge.data.branchName : 'default';
      console.log(`Connecting: Source ${sourceNode.id} (type: ${sourceNode.type}) to Target ${targetNode.id} (type: ${targetNode.type}) with Branch: ${branchName}`);
      sourceNode.next(targetNode, branchName);

      // Manual population of _next for BranchNode
      if (sourceNode.type === 'BranchNode') {
        if (!sourceNode._next) {
          sourceNode._next = {};
        }
        sourceNode._next[branchName] = targetNode;
      }
    } else {
        // This warning should now only trigger if targetNode is undefined
        console.warn(`Skipping connection for edge from ${edge.source} to ${edge.target}. Target node is not an instantiated Qflow node.`);
    }
  });

  const webhookNodeEntry = nodes.find(node => node.type === 'WebHookNode');

  if (webhookNodeEntry) {
    const webhookNodeInstance = flowNodes[webhookNodeEntry.id];
    const targetEdge = edges.find(edge => edge.source === webhookNodeEntry.id);

    if (!targetEdge) {
      return { success: false, error: 'WebHookNode must be connected to at least one other node.' };
    }

    const startNodeOfWebhookFlow = flowNodes[targetEdge.target];
    const webhookFlow = new AsyncFlow(startNodeOfWebhookFlow);

    // The original WebHookNode expects a `flow` object to be passed to it.
    // We are dynamically creating this flow from the nodes connected to the WebHookNode.
    webhookNodeInstance.setParams({ ...webhookNodeInstance.params, flow: webhookFlow, responseStatus: 200 });

    try {
      // The execAsync of the WebHookNode will start the listener.
      await webhookNodeInstance.execAsync({});
      registerWebhook(webhookNodeEntry.id, webhookNodeInstance.server);
      const { port, path } = webhookNodeInstance.params;
      return { success: true, result: `Webhook listener started at http://localhost:${port}${path}`, isWebhookFlow: true, activeWebhookNodeId: webhookNodeEntry.id };
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        return { success: false, error: `Port ${webhookNodeInstance.params.port || 3000} is already in use.` };
      }
      console.error('Failed to start webhook listener:', error);
      return { success: false, error: error.message };
    }
  }

  const inputNode = nodes.find(node => node.type === 'input');
  let startNodeId = null;
  if (inputNode) {
    const startEdge = edges.find(edge => edge.source === inputNode.id);
    if (startEdge) {
      startNodeId = startEdge.target;
    }
  }

  if (!startNodeId) {
    // If no input node or it's not connected, fallback to the old method
    startNodeId = findStartNodeId(nodes, edges);
  }

  const startNode = flowNodes[startNodeId];
  console.log(`WorkflowExecutor: Start node: ${startNode.type} (${startNode.id})`);
  if (!startNode) {
    console.error('Workflow failed: Could not find a start node.');
    return { success: false, error: 'Could not find a start node.' };
  }
  const flow = new AsyncFlow(startNode);

  // Find the agent node to be able to stop it
  const agentNode = Object.values(flowNodes).find(node => node instanceof CustomInteractiveAgent);

  activeWorkflows.set(workflowId, { flow, agent: agentNode });

  try {
    console.log(`Running workflow ${workflowId}...`);
    let result = await flow.runAsync({});
    console.log(`Workflow ${workflowId} finished:`, result);
    return { success: true, result, workflowId, isWebhookFlow: false };
  } catch (error) {
    console.error(`Workflow ${workflowId} failed:`, error);
    return { success: false, error: error.message, workflowId };
  } finally {
    activeWorkflows.delete(workflowId);
  }
};

export const stopWorkflow = (workflowId) => {
  const workflow = activeWorkflows.get(workflowId);
  if (workflow) {
    if (workflow.agent) {
      workflow.agent.stop();
    }
    activeWorkflows.delete(workflowId);
    return { success: true, message: `Workflow ${workflowId} stopped.` };
  } else {
    return { success: false, message: `Workflow ${workflowId} not found.` };
  }
};

export const executeSingleNode = async (nodeData) => {
  const NodeClass = nodeMap[nodeData.type];
  if (!NodeClass) {
    const errorMessage = `Node type ${nodeData.type} not found in nodeMap.`;
    console.error(errorMessage);
    return { success: false, error: errorMessage };
  }

  // Special handling for WebHookNode as a trigger
  if (nodeData.type === 'WebHookNode') {
    const webhookNodeInstance = new NodeClass();
    const resolvedNodeData = {};
    for (const key in nodeData.data) {
      if (key === 'label') {
        resolvedNodeData[key] = extractLabel(nodeData.data[key]);
      } else {
        resolvedNodeData[key] = resolveParameter(nodeData.data[key], {});
      }
    }
    webhookNodeInstance.setParams({ ...resolvedNodeData, responseStatus: 200 });

    // In single node execution, there's no subsequent flow to trigger.
    // We can start the listener, but it won't trigger any action.
    // This is more for testing the listener setup itself.
    try {
      await webhookNodeInstance.execAsync({});
      const { port, path } = webhookNodeInstance.params;
      return { success: true, result: `Webhook listener started at http://localhost:${port}${path}. Note: No flow is attached in single node execution.` };
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        return { success: false, error: `Port ${webhookNodeInstance.params.port || 3000} is already in use.` };
      }
      console.error('Failed to start webhook listener in single node mode:', error);
      // Provide a more specific error if the flow is the issue.
      if (error.message.includes('requires a `flow` parameter')) {
        return { success: false, error: 'Cannot start WebHookNode in isolation. It must be connected to other nodes in a workflow to act as a trigger.' };
      }
      return { success: false, error: error.message };
    }
  }

  try {
    const flowNode = new NodeClass();

    // Store original structured parameters for potential later use (e.g., saving back to UI)
    flowNode._originalParams = nodeData.data;

    // Resolve parameters for initial setParams (only static values)
    const resolvedNodeData = {};
    for (const key in nodeData.data) {
		if (key === 'label') {
			resolvedNodeData[key] = extractLabel(nodeData.data[key]);
		  } else {
			resolvedNodeData[key] = resolveParameter(nodeData.data[key], {}); // Pass an empty shared object
		  }
    }

    // Resolve parameters for initial setParams (only static values)
    for (const key in nodeData.data) {
		if (key === 'label') {
			resolvedNodeData[key] = extractLabel(nodeData.data[key]);
		  } else {
			resolvedNodeData[key] = resolveParameter(nodeData.data[key], {}); // Pass an empty shared object
		  }
    }
    flowNode.setParams(resolvedNodeData);

    // Store original prepAsync and prep methods
    const originalPrepAsync = flowNode.prepAsync;
    const originalPrep = flowNode.prep;

    // Wrap prepAsync to resolve parameters before execution
    flowNode.prepAsync = async (shared) => {
      const currentResolvedParams = resolveNodeParameters(flowNode, shared);
      flowNode.params = currentResolvedParams; // Permanently update flowNode.params
      let prepResult;
      if (originalPrepAsync) {
        prepResult = await originalPrepAsync(shared);
      } else {
        prepResult = {};
      }
      return prepResult;
    };

    // Wrap prep for synchronous nodes
    flowNode.prep = (shared) => {
      const currentResolvedParams = resolveNodeParameters(flowNode, shared);
      flowNode.params = currentResolvedParams; // Permanently update flowNode.params
      let prepResult;
      if (originalPrep) {
        prepResult = originalPrep(shared);
      } else {
        prepResult = {};
      }
      return prepResult;
    };

    // Wrap the single node in an AsyncFlow to ensure consistent execution
    const singleNodeFlow = new AsyncFlow(flowNode);
    console.log(`Executing single node: ${nodeData.type}...`);
    const result = await singleNodeFlow.runAsync({});
    console.log(`Single node ${nodeData.type} finished:`, result);
    return { success: true, result };
  } catch (error) {
    console.error(`Single node ${nodeData.type} execution failed:`, error);
    return { success: false, error: error.message };
  }
};
