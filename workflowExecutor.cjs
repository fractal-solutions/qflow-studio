import { Node, Flow, AsyncNode, AsyncFlow, AsyncBatchNode, AsyncParallelBatchNode } from '@fractal-solutions/qflow';
import { AgentNode, EmbeddingNode, SemanticMemoryNode, MemoryNode, TransformNode, CodeInterpreterNode, UserInputNode, InteractiveInputNode, IteratorNode, SubFlowNode, SchedulerNode, ReadFileNode, WriteFileNode, ShellCommandNode, HttpRequestNode, DeepSeekLLMNode, AgentDeepSeekLLMNode, OpenAILLMNode, AgentOpenAILLMNode, GeminiLLMNode, OllamaLLMNode, AgentOllamaLLMNode, HuggingFaceLLMNode, AgentHuggingFaceLLMNode, OpenRouterLLMNode, AgentOpenRouterLLMNode, DuckDuckGoSearchNode, GoogleSearchNode, ScrapeURLNode, BrowserControlNode, WebHookNode, AppendFileNode, ListDirectoryNode, DataExtractorNode, PDFProcessorNode, SpreadsheetNode, DataValidationNode, GISNode, DisplayImageNode, ImageGalleryNode, HardwareInteractionNode, SpeechSynthesisNode, MultimediaProcessingNode, RemoteExecutionNode, SystemNotificationNode } from '@fractal-solutions/qflow/nodes';
import { SharedStateReaderNode } from './src/qflowNodes/SharedStateReaderNode.js';
import { SharedStateWriterNode } from './src/qflowNodes/SharedStateWriterNode.js';


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
  const sharedKey = [];
  // Instantiate all qflow nodes
  qflowNodes.forEach(node => {
    const NodeClass = nodeMap[node.type];
    if (NodeClass) {
      console.log('node---',node)
      sharedKey.push({key: node.data.outputToSharedKey, nodeType: node.type})
      const flowNode = new NodeClass();
      
      // Store original structured parameters for potential later use (e.g., saving back to UI)
      flowNode._originalParams = node.data;

      // Resolve parameters for initial setParams (only static values)
      const resolvedNodeData = {};
      for (const key in node.data) {
        resolvedNodeData[key] = resolveParameter(node.data[key], {}); // Pass an empty shared object
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

        console.log(`WorkflowExecutor: ${flowNode.type} prepAsync - this.params before originalPrepAsync/execAsync:`, flowNode.params);

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
          console.log(`WorkflowExecutor: Stored output of ${node.type} in shared.${outputKey}:`, execRes);
          if (originalPostAsync) {
            return await originalPostAsync(shared, prepRes, execRes);
          } else {
            return execRes;
          }
        };

        // Wrap post for synchronous Nodes (if applicable)
        flowNode.post = (shared, prepRes, execRes) => {
          shared[outputKey] = execRes; // Store execRes in shared state
          console.log(`WorkflowExecutor: Stored output of ${node.type} in shared.${outputKey}:`, execRes);
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
    return { success: true, result };
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

  try {
    const flowNode = new NodeClass();

    // Store original structured parameters for potential later use (e.g., saving back to UI)
    flowNode._originalParams = nodeData.data;

    // Resolve parameters for initial setParams (only static values)
    const resolvedNodeData = {};
    for (const key in nodeData.data) {
      resolvedNodeData[key] = resolveParameter(nodeData.data[key], {}); // Pass an empty shared object
    }

    // Resolve parameters for initial setParams (only static values)
    for (const key in nodeData.data) {
      resolvedNodeData[key] = resolveParameter(nodeData.data[key], {}); // Pass an empty shared object
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
