import React, { useState } from 'react';
import { FileText, Terminal, Globe, BrainCircuit, Cpu, Database, Share2, GitMerge, Bot, MessageSquare, Sliders, Code, Search, File, Image, CreditCard, Rss, HardDrive, Server, GitBranch, ChevronsLeft, ChevronsRight, ChevronDown, ChevronUp } from 'lucide-react';

const coreNodes = [
    { name: 'Node', icon: <Cpu className="w-5 h-5 mr-3" />, description: 'A single operation' },
    { name: 'Flow', icon: <GitMerge className="w-5 h-5 mr-3" />, description: 'A sequence of nodes' },
    { name: 'AsyncNode', icon: <Cpu className="w-5 h-5 mr-3" />, description: 'An async operation' },
    { name: 'AsyncFlow', icon: <GitMerge className="w-5 h-5 mr-3" />, description: 'An async sequence' },
    { name: 'AsyncBatchNode', icon: <Cpu className="w-5 h-5 mr-3" />, description: 'An async batch operation' },
    { name: 'AsyncParallelBatchNode', icon: <Cpu className="w-5 h-5 mr-3" />, description: 'A parallel async batch' },
    { name: 'AgentNode', icon: <Bot className="w-5 h-5 mr-3" />, description: 'Autonomous agent' },
    { name: 'EmbeddingNode', icon: <Cpu className="w-5 h-5 mr-3" />, description: 'Generate embeddings' },
    { name: 'SemanticMemoryNode', icon: <Database className="w-5 h-5 mr-3" />, description: 'Semantic memory' },
    { name: 'MemoryNode', icon: <Database className="w-5 h-5 mr-3" />, description: 'Keyword memory' },
    { name: 'TransformNode', icon: <Sliders className="w-5 h-5 mr-3" />, description: 'Transform data' },
    { name: 'CodeInterpreterNode', icon: <Code className="w-5 h-5 mr-3" />, description: 'Execute code' },
    { name: 'UserInputNode', icon: <MessageSquare className="w-5 h-5 mr-3" />, description: 'Get user input' },
    { name: 'InteractiveInputNode', icon: <MessageSquare className="w-5 h-5 mr-3" />, description: 'Get GUI input' },
    { name: 'IteratorNode', icon: <Share2 className="w-5 h-5 mr-3" />, description: 'Iterate over items' },
    { name: 'SubFlowNode', icon: <GitMerge className="w-5 h-5 mr-3" />, description: 'Run a subflow' },
    { name: 'SchedulerNode', icon: <Sliders className="w-5 h-5 mr-3" />, description: 'Schedule a flow' },
    { name: 'SharedStateReaderNode', icon: <Share2 className="w-5 h-5 mr-3" />, description: 'Read from shared state' },
    { name: 'SharedStateWriterNode', icon: <Share2 className="w-5 h-5 mr-3" />, description: 'Write to shared state' },
    { name: 'BranchNode', icon: <GitBranch className="w-5 h-5 mr-3" />, description: 'Conditional branching' },
];

const integratedNodes = {
    'LLMs': [
        { name: 'DeepSeekLLMNode', icon: <BrainCircuit className="w-5 h-5 mr-3" />, description: 'DeepSeek LLM' },
        { name: 'AgentDeepSeekLLMNode', icon: <BrainCircuit className="w-5 h-5 mr-3" />, description: 'Agent DeepSeek LLM' },
        { name: 'OpenAILLMNode', icon: <BrainCircuit className="w-5 h-5 mr-3" />, description: 'OpenAI LLM' },
        { name: 'AgentOpenAILLMNode', icon: <BrainCircuit className="w-5 h-5 mr-3" />, description: 'Agent OpenAI LLM' },
        { name: 'GeminiLLMNode', icon: <BrainCircuit className="w-5 h-5 mr-3" />, description: 'Gemini LLM' },
        { name: 'OllamaLLMNode', icon: <BrainCircuit className="w-5 h-5 mr-3" />, description: 'Ollama LLM' },
        { name: 'AgentOllamaLLMNode', icon: <BrainCircuit className="w-5 h-5 mr-3" />, description: 'Agent Ollama LLM' },
        { name: 'HuggingFaceLLMNode', icon: <BrainCircuit className="w-5 h-5 mr-3" />, description: 'HuggingFace LLM' },
        { name: 'AgentHuggingFaceLLMNode', icon: <BrainCircuit className="w-5 h-5 mr-3" />, description: 'Agent HuggingFace LLM' },
        { name: 'OpenRouterLLMNode', icon: <BrainCircuit className="w-5 h-5 mr-3" />, description: 'OpenRouter LLM' },
        { name: 'AgentOpenRouterLLMNode', icon: <BrainCircuit className="w-5 h-5 mr-3" />, description: 'Agent OpenRouter LLM' },
        { name: 'CustomLLMNode', icon: <BrainCircuit className="w-5 h-5 mr-3" />, description: 'Customizable LLM' },
        { name: 'CustomAgentNode', icon: <Bot className="w-5 h-5 mr-3" />, description: 'Customizable Agent' },
    ],
    'Web': [
        { name: 'ShellCommandNode', icon: <Terminal className="w-5 h-5 mr-3" />, description: 'Execute shell command' },
        { name: 'HttpRequestNode', icon: <Globe className="w-5 h-5 mr-3" />, description: 'Make HTTP request' },
        { name: 'DuckDuckGoSearchNode', icon: <Search className="w-5 h-5 mr-3" />, description: 'DuckDuckGo search' },
        { name: 'GoogleSearchNode', icon: <Search className="w-5 h-5 mr-3" />, description: 'Google search' },
        { name: 'WebScraperNode', icon: <Globe className="w-5 h-5 mr-3" />, description: 'Scrape a website' },
        { name: 'BrowserControlNode', icon: <Globe className="w-5 h-5 mr-3" />, description: 'Control a browser' },
        { name: 'WebSocketsNode', icon: <Share2 className="w-5 h-5 mr-3" />, description: 'WebSocket client' },
        { name: 'WebHookNode', icon: <Share2 className="w-5 h-5 mr-3" />, description: 'Receive a webhook' },
    ],
    'File System': [
        { name: 'WriteFileNode', icon: <FileText className="w-5 h-5 mr-3" />, description: 'Write to a file' },
        { name: 'ReadFileNode', icon: <FileText className="w-5 h-5 mr-3" />, description: 'Read from a file' },
        { name: 'AppendFileNode', icon: <FileText className="w-5 h-5 mr-3" />, description: 'Append to a file' },
        { name: 'ListDirectoryNode', icon: <File className="w-5 h-5 mr-3" />, description: 'List a directory' },
    ],
    'Data': [
        { name: 'DataExtractorNode', icon: <Code className="w-5 h-5 mr-3" />, description: 'Extract data' },
        { name: 'PDFProcessorNode', icon: <File className="w-5 h-5 mr-3" />, description: 'Process a PDF' },
        { name: 'SpreadsheetNode', icon: <File className="w-5 h-5 mr-3" />, description: 'Work with spreadsheets' },
        { name: 'DataValidationNode', icon: <Code className="w-5 h-5 mr-3" />, description: 'Validate data' },
    ],
    'VCS': [
        { name: 'GitNode', icon: <GitBranch className="w-5 h-5 mr-3" />, description: 'Git operations' },
        { name: 'GitHubNode', icon: <GitBranch className="w-5 h-5 mr-3" />, description: 'GitHub operations' },
    ],
    'Hardware & System': [
        { name: 'GISNode', icon: <Globe className="w-5 h-5 mr-3" />, description: 'GIS operations' },
        { name: 'DisplayImageNode', icon: <Image className="w-5 h-5 mr-3" />, description: 'Display an image' },
        { name: 'ImageGalleryNode', icon: <Image className="w-5 h-5 mr-3" />, description: 'Create an image gallery' },
        { name: 'HardwareInteractionNode', icon: <HardDrive className="w-5 h-5 mr-3" />, description: 'Interact with hardware' },
        { name: 'SpeechSynthesisNode', icon: <MessageSquare className="w-5 h-5 mr-3" />, description: 'Text to speech' },
        { name: 'MultimediaProcessingNode', icon: <Server className="w-5 h-5 mr-3" />, description: 'Process multimedia' },
        { name: 'RemoteExecutionNode', icon: <Server className="w-5 h-5 mr-3" />, description: 'Execute remote commands' },
        { name: 'SystemNotificationNode', icon: <MessageSquare className="w-5 h-5 mr-3" />, description: 'System notification' },
    ],
    'Payments': [
        { name: 'StripeNode', icon: <CreditCard className="w-5 h-5 mr-3" />, description: 'Stripe operations' },
    ],
    'Social': [
        { name: 'HackerNewsNode', icon: <Rss className="w-5 h-5 mr-3" />, description: 'Hacker News' },
    ],
};

const Sidebar = () => {
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (category) => {
    setCollapsedCategories(prevState => ({
      ...prevState,
      [category]: !prevState[category]
    }));
  };

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredCoreNodes = coreNodes.filter(node =>
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredIntegratedNodes = Object.entries(integratedNodes).reduce((acc, [category, nodes]) => {
    const filteredNodes = nodes.filter(node =>
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredNodes.length > 0) {
      acc[category] = filteredNodes;
    }
    return acc;
  }, {});

  return (
    <aside className="bg-[var(--color-surface)] p-4 border-l border-[var(--color-border)] overflow-y-auto h-full w-1/4 hide-scrollbar z-20">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Available Nodes</h3>
        </div>
        <div className="sticky top-[-8px] z-10 bg-[var(--color-surface)]/90 pt-2 backdrop-blur-sm">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-textMuted)]" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--color-surfaceHover)] border border-[var(--color-border)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-colors"
            />
          </div>
        </div>
      <div className="space-y-4">
        <div>
          <h4 className="text-md font-semibold mb-2 text-[var(--color-textSecondary)] flex items-center justify-between">
            Core Nodes
            <button onClick={() => toggleCategory('Core Nodes')} className="text-[var(--color-textMuted)] hover:text-[var(--color-text)]">
              {collapsedCategories['Core Nodes'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </h4>
          {!collapsedCategories['Core Nodes'] && (
            <div className="space-y-2">
              {filteredCoreNodes.map((node) => (
                <div
                  key={node.name}
                  onDragStart={(event) => onDragStart(event, node.name)}
                  draggable
                  className="flex items-center p-3 border border-transparent rounded-lg cursor-grab bg-[var(--color-surfaceHover)] text-[var(--color-textSecondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/50 transition-colors"
                >
                  {node.icon}
                  <div className="flex flex-col">
                      <span className="font-medium text-sm">{node.name}</span>
                      <span className="text-xs text-[var(--color-textMuted)]">{node.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h4 className="text-md font-semibold mb-2 text-[var(--color-textSecondary)] flex items-center justify-between">
            Integrated Nodes
            <button onClick={() => toggleCategory('Integrated Nodes')} className="text-[var(--color-textMuted)] hover:text-[var(--color-text)]">
              {collapsedCategories['Integrated Nodes'] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </h4>
          {!collapsedCategories['Integrated Nodes'] && (
            <div>
              {Object.entries(filteredIntegratedNodes).map(([category, nodes]) => (
                <div key={category} className="mb-4">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between text-sm font-semibold mb-2 py-1 px-2 rounded-md text-[var(--color-textMuted)] hover:bg-[var(--color-surfaceHover)] transition-colors"
                  >
                    <span>{category}</span>
                    {collapsedCategories[category] ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                  {!collapsedCategories[category] && (
                    <div className="space-y-2">
                      {nodes.map((node) => (
                        <div
                          key={node.name}
                          onDragStart={(event) => onDragStart(event, node.name)}
                          draggable
                          className="flex items-center p-3 border border-transparent rounded-lg cursor-grab bg-[var(--color-surfaceHover)] text-[var(--color-textSecondary)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/50 transition-colors"
                        >
                          {node.icon}
                          <div className="flex flex-col">
                              <span className="font-medium text-sm">{node.name}</span>
                              <span className="text-xs text-[var(--color-textMuted)]">{node.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
