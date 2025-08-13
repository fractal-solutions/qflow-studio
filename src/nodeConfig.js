import { DEFAULT_AGENT_SYSTEM_PROMPT } from './constants/agentPrompts';

export const nodeConfig = {
  ReadFileNode: {
    fields: [
      { name: 'label', type: 'text', label: 'Label' },
      { name: 'filePath', type: 'text', label: 'File Path' },
    ],
  },
  WriteFileNode: {
    fields: [
      { name: 'label', type: 'text', label: 'Label' },
      { name: 'filePath', type: 'text', label: 'File Path' },
      { name: 'content', type: 'textarea', label: 'Content' },
    ],
  },
  ShellCommandNode: {
    fields: [
      { name: 'label', type: 'text', label: 'Label' },
      { name: 'command', type: 'text', label: 'Command' },
    ],
  },
  HttpRequestNode: {
    fields: [
      { name: 'label', type: 'text', label: 'Label' },
      { name: 'url', type: 'text', label: 'URL' },
      { name: 'method', type: 'select', label: 'Method', options: ['GET', 'POST', 'PUT', 'DELETE'] },
    ],
  },
  DeepSeekLLMNode: {
    fields: [
      { name: 'label', type: 'text', label: 'Label' },
      { name: 'prompt', type: 'textarea', label: 'Prompt' },
    ],
  },
  WebHookNode: {
    fields: [
      { name: 'label', type: 'text', label: 'Label' },
      { name: 'port', type: 'number', label: 'Port', defaultValue: 3000 },
      { name: 'path', type: 'text', label: 'Path', defaultValue: '/webhook' },
      { name: 'responseMessage', type: 'text', label: 'Response Message' },
    ],
  },
  input: {
    fields: [
        { name: 'label', type: 'text', label: 'Label' },
    ]
  },
  BranchNode: {
    fields: [
      { name: 'label', type: 'text', label: 'Label' },
      { name: 'conditionSource', type: 'select', label: 'Condition Source', options: ['static', 'sharedState', 'expression'], defaultValue: 'static' },
      { name: 'conditionValue', type: 'textarea', label: 'Condition Value/Key', placeholder: 'e.g., true, my_data.status, x > 5' },
      { name: 'branches', type: 'json', label: 'Branches (JSON Array)', placeholder: '[{"value": "true", "label": "True Branch"}, {"value": "false", "label": "False Branch"}]' , defaultValue: '[{"value": "default", "label": "Default Branch"}]' },
    ],
  },
  CustomLLMNode: {
    fields: [
      { name: 'label', type: 'text', label: 'Label' },
      { name: 'provider', type: 'select', label: 'LLM Provider (Optional)', options: ['', 'OpenRouter', 'DeepSeek', 'OpenAI', 'Gemini', 'Ollama', 'HuggingFace'] },
      { name: 'apiUrl', type: 'text', label: 'API URL (Optional, defaults to provider)', placeholder: 'e.g., https://api.openai.com/v1/chat/completions' },
      { name: 'apiKey', type: 'text', label: 'API Key (Optional, required by some providers)' },
      { name: 'model', type: 'text', label: 'Model (Optional, defaults to provider)', placeholder: 'e.g., gpt-3.5-turbo' },
      { name: 'prompt', type: 'textarea', label: 'Prompt' },
      { name: 'requestBody', type: 'json', label: 'Request Body (JSON, merged with provider defaults)', placeholder: '{"messages":[{"role":"user","content":"Hello"}]}' },
      { name: 'responsePath', type: 'text', label: 'Response Path (Optional, defaults to provider)', placeholder: 'e.g., choices[0].message.content' },
      { name: 'baseUrl', type: 'text', label: 'Base URL (for Ollama/HuggingFace)', placeholder: 'http://localhost:11434' },
    ],
  },
  CustomAgentNode: {
    fields: [
      { name: 'label', type: 'text', label: 'Label' },
      { name: 'provider', type: 'select', label: 'LLM Provider', options: ['OpenRouter', 'DeepSeek', 'OpenAI', 'Gemini', 'Ollama', 'HuggingFace'] },
      { name: 'apiKey', type: 'text', label: 'API Key' },
      { name: 'model', type: 'text', label: 'Model' },
      { name: 'baseUrl', type: 'text', label: 'Base URL (for Ollama/HuggingFace)' },
      { name: 'systemPrompt', type: 'textarea', label: 'Agent System Prompt', defaultValue: DEFAULT_AGENT_SYSTEM_PROMPT },
      { name: 'goal', type: 'textarea', label: 'Agent Goal' },
      { name: 'tools', type: 'multiselect', label: 'Available Tools', options: [
        'DuckDuckGoSearchNode', 'ShellCommandNode', 'ReadFileNode', 'WriteFileNode', 'HttpRequestNode',
        'ScrapeURLNode', 'UserInputNode', 'SemanticMemoryNode', 'TransformNode', 'CodeInterpreterNode',
        'SubFlowNode', 'IteratorNode', 'InteractiveInputNode', 'SystemNotificationNode', 'BrowserControlNode',
        'AppendFileNode', 'MemoryNode', 'GoogleSearchNode', 'WebSocketsNode', 'DataExtractorNode',
        'PDFProcessorNode', 'SpreadsheetNode', 'DataValidationNode', 'GitNode', 'GitHubNode', 'GISNode',
        'DisplayImageNode', 'ImageGalleryNode', 'HardwareInteractionNode', 'SpeechSynthesisNode',
        'MultimediaProcessingNode', 'RemoteExecutionNode', 'StripeNode', 'HackerNewsNode'
      ]},
      { name: 'maxIterations', type: 'number', label: 'Max Iterations', defaultValue: 10 },
      { name: 'temperature', type: 'number', label: 'Temperature', defaultValue: 0.7 },
    ],
  }
};
