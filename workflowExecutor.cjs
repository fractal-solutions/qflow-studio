import { Node, Flow, AsyncNode, AsyncFlow, AsyncBatchNode, AsyncParallelBatchNode, AgentNode, EmbeddingNode, SemanticMemoryNode, MemoryNode, TransformNode, CodeInterpreterNode, UserInputNode, InteractiveInputNode, IteratorNode, SubFlowNode, SchedulerNode } from '@fractal-solutions/qflow';
import { ReadFileNode, WriteFileNode, ShellCommandNode, HttpRequestNode, DeepSeekLLMNode, AgentDeepSeekLLMNode, OpenAILLMNode, AgentOpenAILLMNode, GeminiLLMNode, OllamaLLMNode, AgentOllamaLLMNode, HuggingFaceLLMNode, AgentHuggingFaceLLMNode, OpenRouterLLMNode, AgentOpenRouterLLMNode, DuckDuckGoSearchNode, GoogleSearchNode, WebScraperNode, BrowserControlNode, WebSocketsNode, WebHookNode, AppendFileNode, ListDirectoryNode, DataExtractorNode, PDFProcessorNode, SpreadsheetNode, DataValidationNode, GitNode, GitHubNode, GISNode, DisplayImageNode, ImageGalleryNode, HardwareInteractionNode, SpeechSynthesisNode, MultimediaProcessingNode, RemoteExecutionNode, SystemNotificationNode, StripeNode, HackerNewsNode } from '@fractal-solutions/qflow/nodes';

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
  WebScraperNode,
  BrowserControlNode,
  WebSocketsNode,
  WebHookNode,
  AppendFileNode,
  ListDirectoryNode,
  DataExtractorNode,
  PDFProcessorNode,
  SpreadsheetNode,
  DataValidationNode,
  GitNode,
  GitHubNode,
  GISNode,
  DisplayImageNode,
  ImageGalleryNode,
  HardwareInteractionNode,
  SpeechSynthesisNode,
  MultimediaProcessingNode,
  RemoteExecutionNode,
  SystemNotificationNode,
  StripeNode,
  HackerNewsNode,
};

export const executeWorkflow = async (nodes, edges) => {
  if (!nodes || nodes.length === 0) {
    console.error('No nodes to execute.');
    return;
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
    return;
  }

  const startNode = flowNodes[startNodeId];
  const flow = new AsyncFlow(startNode);

  try {
    console.log('Running workflow...');
    const result = await flow.runAsync({});
    console.log('Workflow finished:', result);
    alert('Workflow finished successfully!');
  } catch (error) {
    console.error('Workflow failed:', error);
    alert('Workflow failed. Check the console for details.');
  }
};
