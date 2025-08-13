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
        const toolMap = {
            DuckDuckGoSearchNode: DuckDuckGoSearchNode,
            ShellCommandNode: ShellCommandNode,
            ReadFileNode: ReadFileNode,
            WriteFileNode: WriteFileNode,
            HttpRequestNode: HttpRequestNode,
            ScrapeURLNode: ScrapeURLNode,
            InteractiveInputNode: InteractiveInputNode, // Use InteractiveInputNode instead of UserInputNode
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
                    // Instantiate the tool and pass relevant parameters if needed
                    // For now, assuming tools don't need specific parameters at instantiation
                    const toolInstance = new toolMap[toolName]();
                    
                    // Special handling for InteractiveInputNode to set default parameters
                    if (toolName === 'InteractiveInputNode') {
                        toolInstance.setParams({
                            title: 'QFlow Studio Agent',
                            defaultValue: '',
                            prompt: 'Please provide input:'
                        });
                    }
                    
                    // Map tool names to the expected format for agents
                    let toolKey = toolName.replace('Node', '').toLowerCase();
                    
                    // Special handling for InteractiveInputNode to use underscore format
                    if (toolName === 'InteractiveInputNode') {
                        toolKey = 'interactive_input';
                    } else if (toolName === 'SystemNotificationNode') {
                        toolKey = 'system_notification';
                    }
                    
                    availableTools[toolKey] = toolInstance;
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
