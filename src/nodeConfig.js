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
  input: {
    fields: [
        { name: 'label', type: 'text', label: 'Label' },
    ]
  }
};
