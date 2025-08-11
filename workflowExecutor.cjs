import { Node, Flow, AsyncNode, AsyncFlow, AsyncBatchNode, AsyncParallelBatchNode } from '@fractal-solutions/qflow';
import { AgentNode, EmbeddingNode, SemanticMemoryNode, MemoryNode, TransformNode, CodeInterpreterNode, UserInputNode, InteractiveInputNode, IteratorNode, SubFlowNode, SchedulerNode, ReadFileNode, WriteFileNode, ShellCommandNode, HttpRequestNode, DeepSeekLLMNode, AgentDeepSeekLLMNode, OpenAILLMNode, AgentOpenAILLMNode, GeminiLLMNode, OllamaLLMNode, AgentOllamaLLMNode, HuggingFaceLLMNode, AgentHuggingFaceLLMNode, OpenRouterLLMNode, AgentOpenRouterLLMNode, DuckDuckGoSearchNode, GoogleSearchNode, ScrapeURLNode, BrowserControlNode, WebHookNode, AppendFileNode, ListDirectoryNode, DataExtractorNode, PDFProcessorNode, SpreadsheetNode, DataValidationNode, GISNode, DisplayImageNode, ImageGalleryNode, HardwareInteractionNode, SpeechSynthesisNode, MultimediaProcessingNode, RemoteExecutionNode, SystemNotificationNode } from '@fractal-solutions/qflow/nodes';

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
};

export const executeWorkflow = async (nodes, edges) => {
  if (!nodes || nodes.length === 0) {
    console.error('No nodes to execute.');
    return { success: false, error: 'No nodes to execute.' };
  }

  const flowNodes = {};

  // Instantiate all nodes
  nodes.forEach(node => {
    const NodeClass = nodeMap[node.type];
    if (NodeClass) {
      const flowNode = new NodeClass();
      flowNode.setParams(node.data);
      flowNodes[node.id] = flowNode;
    } else {
        console.warn(`Node type ${node.type} not found in nodeMap.`);
    }
  });

  // Connect nodes based on edges
  edges.forEach(edge => {
    const sourceNode = flowNodes[edge.source];
    const targetNode = flowNodes[edge.target];
    if (sourceNode && targetNode) {
      sourceNode.next(targetNode);
    }
  });

  // Find the start node (assuming it's the one with no incoming edges)
  const startNodeId = nodes.find(node => !edges.some(edge => edge.target === node.id))?.id;
  if (!startNodeId) {
    console.error('Could not find a start node.');
    return { success: false, error: 'Could not find a start node.' };
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
    flowNode.setParams(nodeData.data);

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
