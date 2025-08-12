import { Node, Flow, AsyncNode, AsyncFlow, AsyncBatchNode, AsyncParallelBatchNode } from '@fractal-solutions/qflow';
import { AgentNode, EmbeddingNode, SemanticMemoryNode, MemoryNode, TransformNode, CodeInterpreterNode, UserInputNode, InteractiveInputNode, IteratorNode, SubFlowNode, SchedulerNode, ReadFileNode, WriteFileNode, ShellCommandNode, HttpRequestNode, DeepSeekLLMNode, AgentDeepSeekLLMNode, OpenAILLMNode, AgentOpenAILLMNode, GeminiLLMNode, OllamaLLMNode, AgentOllamaLLMNode, HuggingFaceLLMNode, AgentHuggingFaceLLMNode, OpenRouterLLMNode, AgentOpenRouterLLMNode, DuckDuckGoSearchNode, GoogleSearchNode, ScrapeURLNode, BrowserControlNode, WebHookNode, AppendFileNode, ListDirectoryNode, DataExtractorNode, PDFProcessorNode, SpreadsheetNode, DataValidationNode, GISNode, DisplayImageNode, ImageGalleryNode, HardwareInteractionNode, SpeechSynthesisNode, MultimediaProcessingNode, RemoteExecutionNode, SystemNotificationNode } from '@fractal-solutions/qflow/nodes';
import { SharedStateReaderNode } from './src/qflowNodes/SharedStateReaderNode.js';
import { SharedStateWriterNode } from './src/qflowNodes/SharedStateWriterNode.js';
import { registerWebhook } from './webhookRegistry.js';


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
};

export const executeWorkflow = async (nodes, edges) => {
  if (!nodes || nodes.length === 0) {
    console.error('No nodes to execute.');
    return { success: false, error: 'No nodes to execute.' };
  }

  const flowNodes = {};
  const qflowNodes = nodes.filter(node => node.type !== 'input'); // Filter out React Flow's 'input' node
  // Instantiate all qflow nodes
  qflowNodes.forEach(node => {
    const NodeClass = nodeMap[node.type];
    if (NodeClass) {
      const flowNode = new NodeClass();
      
      // Store original structured parameters for potential later use (e.g., saving back to UI)
      flowNode._originalParams = node.data;

      // Resolve parameters for initial setParams (only static values)
      const resolvedNodeData = {};
      for (const key in node.data) {
		if (key === 'label') {
			resolvedNodeData[key] = extractLabel(node.data[key]);
		  } else {
			resolvedNodeData[key] = resolveParameter(node.data[key], {}); // Pass an empty shared object
		  }
      }
      flowNode.setParams(resolvedNodeData);

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
          const originalResult = await originalPrepAsync(shared);
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
          prepResult = originalPrep(shared);
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
            return await originalPostAsync(shared, prepRes, execRes);
          } else {
            return execRes;
          }
        };

        // Wrap post for synchronous Nodes (if applicable)
        flowNode.post = (shared, prepRes, execRes) => {
          shared[outputKey] = execRes; // Store execRes in shared state
          console.log(`WorkflowExecutor: Stored output of ${flowNode.params.label} in shared.${outputKey}:`, execRes);
          if (originalPost) {
            return originalPost(shared, prepRes, execRes);
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
  edges.forEach(edge => {
    const sourceNode = flowNodes[edge.source];
    const targetNode = flowNodes[edge.target];
    if (sourceNode && targetNode) {
      sourceNode.next(targetNode);
    }
  });

  const webhookNodeEntry = qflowNodes.find(node => node.type === 'WebHookNode');

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

  // Find the actual qflow start node (a qflow node with no incoming edges from other qflow nodes)
  const qflowNodeIds = qflowNodes.map(node => node.id);
  const startNodeId = qflowNodeIds.find(nodeId => {
    return !edges.some(edge => edge.target === nodeId && qflowNodeIds.includes(edge.source));
  });

  if (!startNodeId) {
    console.error('Could not find a valid qflow start node.');
    return { success: false, error: 'Could not find a valid qflow start node.' };
  }

  const startNode = flowNodes[startNodeId];
  const flow = new AsyncFlow(startNode);

  try {
    console.log('Running workflow...');
    const result = await flow.runAsync({});
    console.log('Workflow finished:', result);
    return { success: true, result, isWebhookFlow: false };
  } catch (error) {
    console.error('Workflow failed:', error);
    return { success: false, error: error.message };
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
