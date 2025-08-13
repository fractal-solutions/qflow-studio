import { AsyncNode } from '@fractal-solutions/qflow';
import { AgentDeepSeekLLMNode, AgentOpenAILLMNode, AgentGeminiLLMNode, AgentOllamaLLMNode, AgentHuggingFaceLLMNode, AgentOpenRouterLLMNode, DuckDuckGoSearchNode, ShellCommandNode, ReadFileNode, WriteFileNode, HttpRequestNode, ScrapeURLNode, InteractiveInputNode, SemanticMemoryNode, TransformNode, CodeInterpreterNode, SubFlowNode, IteratorNode, SystemNotificationNode, BrowserControlNode, AppendFileNode, MemoryNode, GoogleSearchNode, DataExtractorNode, PDFProcessorNode, SpreadsheetNode, DataValidationNode, GISNode, DisplayImageNode, ImageGalleryNode, HardwareInteractionNode, SpeechSynthesisNode, MultimediaProcessingNode, RemoteExecutionNode } from '@fractal-solutions/qflow/nodes';
import { CustomAgent } from './custom/agent.js';

export class CustomInteractiveAgent extends AsyncNode {
    constructor(maxRetries = 3, wait = 2) {
        super(maxRetries, wait);
    }

    async execAsync() {
        const { 
            provider, apiKey, model, baseUrl, systemPrompt, goal, tools, 
            maxIterations, temperature 
        } = this.params;

        if (!provider) {
            throw new Error('LLM Provider is required for CustomInteractiveAgent.');
        }
        if (!goal) {
            throw new Error('Agent Goal is required for CustomInteractiveAgent.');
        }

        let agentLLM;

        switch (provider) {
            case 'OpenRouter':
                agentLLM = new AgentOpenRouterLLMNode();
                break;
            case 'DeepSeek':
                agentLLM = new AgentDeepSeekLLMNode();
                break;
            case 'OpenAI':
                agentLLM = new AgentOpenAILLMNode();
                break;
            case 'Gemini':
                agentLLM = new AgentGeminiLLMNode();
                break;
            case 'Ollama':
                agentLLM = new AgentOllamaLLMNode();
                break;
            case 'HuggingFace':
                agentLLM = new AgentHuggingFaceLLMNode();
                break;
            default:
                throw new Error(`Unsupported LLM provider: ${provider}`);
        }

        // Set parameters using setParams method - only pass essential parameters
        // The AgentNode will handle conversation history and prompt management
        agentLLM.setParams({ apiKey, model, temperature });

        const availableTools = {};
        // Map Node class names (from frontend) to their snake_case tool keys (for AgentNode)
        const nodeClassToToolKeyMap = {
            'DuckDuckGoSearchNode': 'duckduckgo_search',
            'ShellCommandNode': 'shell_command',
            'ReadFileNode': 'read_file',
            'WriteFileNode': 'write_file',
            'HttpRequestNode': 'http_request',
            'ScrapeURLNode': 'web_scraper',
            'InteractiveInputNode': 'interactive_input',
            'SemanticMemoryNode': 'semantic_memory_node',
            'TransformNode': 'transform_node',
            'CodeInterpreterNode': 'code_interpreter',
            'SubFlowNode': 'sub_flow',
            'IteratorNode': 'iterator',
            'SystemNotificationNode': 'system_notification',
            'BrowserControlNode': 'browser_control',
            'AppendFileNode': 'append_file',
            'MemoryNode': 'memory_node',
            'GoogleSearchNode': 'google_search',
            'DataExtractorNode': 'data_extractor',
            'PDFProcessorNode': 'pdf_processor',
            'SpreadsheetNode': 'spreadsheet',
            'DataValidationNode': 'data_validation',
            'GISNode': 'gis',
            'DisplayImageNode': 'display_image',
            'ImageGalleryNode': 'image_gallery',
            'HardwareInteractionNode': 'hardware_interaction',
            'SpeechSynthesisNode': 'speech_synthesis',
            'MultimediaProcessingNode': 'multimedia_processing',
            'RemoteExecutionNode': 'remote_execution',
        };

        // The toolMap maps Node class names to actual Node classes
        const toolMap = {
            DuckDuckGoSearchNode: DuckDuckGoSearchNode,
            ShellCommandNode: ShellCommandNode,
            ReadFileNode: ReadFileNode,
            WriteFileNode: WriteFileNode,
            HttpRequestNode: HttpRequestNode,
            ScrapeURLNode: ScrapeURLNode,
            InteractiveInputNode: InteractiveInputNode,
            SemanticMemoryNode: SemanticMemoryNode,
            TransformNode: TransformNode,
            CodeInterpreterNode: CodeInterpreterNode,
            SubFlowNode: SubFlowNode,
            IteratorNode: IteratorNode,
            SystemNotificationNode: SystemNotificationNode,
            BrowserControlNode: BrowserControlNode,
            AppendFileNode: AppendFileNode,
            MemoryNode: MemoryNode,
            GoogleSearchNode: GoogleSearchNode,
            DataExtractorNode: DataExtractorNode,
            PDFProcessorNode: PDFProcessorNode,
            SpreadsheetNode: SpreadsheetNode,
            DataValidationNode: DataValidationNode,
            GISNode: GISNode,
            DisplayImageNode: DisplayImageNode,
            ImageGalleryNode: ImageGalleryNode,
            HardwareInteractionNode: HardwareInteractionNode,
            SpeechSynthesisNode: SpeechSynthesisNode,
            MultimediaProcessingNode: MultimediaProcessingNode,
            RemoteExecutionNode: RemoteExecutionNode,
        };

        if (tools && Array.isArray(tools)) {
            tools.forEach(toolName => {
                if (toolMap[toolName]) {
                    const toolInstance = new toolMap[toolName]();
                    
                    // Special handling for InteractiveInputNode to set default parameters
                    if (toolName === 'InteractiveInputNode') {
                        toolInstance.setParams({
                            title: 'QFlow Studio Agent',
                            defaultValue: '',
                            prompt: 'Please provide input:'
                        });
                    }
                    
                    // Get the correct snake_case toolKey from the map
                    const toolKey = nodeClassToToolKeyMap[toolName];
                    
                    if (toolKey) {
                        availableTools[toolKey] = toolInstance;
                    } else {
                        console.warn(`No snake_case mapping found for tool: ${toolName}`);
                    }
                } else {
                    console.warn(`Tool ${toolName} not found or supported.`);
                }
            });
        }

        // For now, summarization LLM is the same as agent LLM
        const summarizeLLM = agentLLM; 

        const agent = new CustomAgent(agentLLM, availableTools, summarizeLLM);
        agent.setParams({ goal, maxIterations, systemPrompt });
        
        // Ensure the agent has access to the available tools for prompt building
        agent.availableTools = availableTools;

        console.log('[CustomInteractiveAgent] Running agent with goal:', goal);
        const result = await agent.execAsync();
        console.log('[CustomInteractiveAgent] Agent finished with result:', result);

        return result;
    }

    async postAsync(shared, prepRes, execRes) {
        shared.agentResult = execRes;
        return 'default';
    }
}
