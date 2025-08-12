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
  }
};
