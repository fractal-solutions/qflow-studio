import { AsyncNode, AgentNode, AgentDeepSeekLLMNode, AgentOpenAILLMNode, AgentGeminiLLMNode, AgentOllamaLLMNode, AgentHuggingFaceLLMNode, AgentOpenRouterLLMNode, DuckDuckGoSearchNode, ShellCommandNode, ReadFileNode, WriteFileNode, HttpRequestNode, ScrapeURLNode, UserInputNode, SemanticMemoryNode, TransformNode, CodeInterpreterNode, SubFlowNode, IteratorNode, InteractiveInputNode, SystemNotificationNode, BrowserControlNode, AppendFileNode, MemoryNode, GoogleSearchNode, WebSocketsNode, DataExtractorNode, PDFProcessorNode, SpreadsheetNode, DataValidationNode, GitNode, GitHubNode, GISNode, DisplayImageNode, ImageGalleryNode, HardwareInteractionNode, SpeechSynthesisNode, MultimediaProcessingNode, RemoteExecutionNode, StripeNode, HackerNewsNode } from '@fractal-solutions/qflow';

export class CustomAgentNode extends AsyncNode {
    constructor(maxRetries = 3, wait = 2) {
        super(maxRetries, wait);
    }

    async execAsync() {
        const { 
            provider, apiKey, model, baseUrl, systemPrompt, goal, tools, 
            maxIterations, temperature 
        } = this.params;

        if (!provider) {
            throw new Error('LLM Provider is required for CustomAgentNode.');
        }
        if (!goal) {
            throw new Error('Agent Goal is required for CustomAgentNode.');
        }

        let agentLLM;
        const llmParams = { apiKey, model, baseUrl, temperature };

        switch (provider) {
            case 'OpenRouter':
                agentLLM = new AgentOpenRouterLLMNode(llmParams);
                break;
            case 'DeepSeek':
                agentLLM = new AgentDeepSeekLLMNode(llmParams);
                break;
            case 'OpenAI':
                agentLLM = new AgentOpenAILLMNode(llmParams);
                break;
            case 'Gemini':
                agentLLM = new AgentGeminiLLMNode(llmParams);
                break;
            case 'Ollama':
                agentLLM = new AgentOllamaLLMNode(llmParams);
                break;
            case 'HuggingFace':
                agentLLM = new AgentHuggingFaceLLMNode(llmParams);
                break;
            default:
                throw new Error(`Unsupported LLM provider: ${provider}`);
        }

        const availableTools = {};
        const toolMap = {
            DuckDuckGoSearchNode: DuckDuckGoSearchNode,
            ShellCommandNode: ShellCommandNode,
            ReadFileNode: ReadFileNode,
            WriteFileNode: WriteFileNode,
            HttpRequestNode: HttpRequestNode,
            ScrapeURLNode: ScrapeURLNode,
            UserInputNode: UserInputNode,
            SemanticMemoryNode: SemanticMemoryNode,
            TransformNode: TransformNode,
            CodeInterpreterNode: CodeInterpreterNode,
            SubFlowNode: SubFlowNode,
            IteratorNode: IteratorNode,
            InteractiveInputNode: InteractiveInputNode,
            SystemNotificationNode: SystemNotificationNode,
            BrowserControlNode: BrowserControlNode,
            AppendFileNode: AppendFileNode,
            MemoryNode: MemoryNode,
            GoogleSearchNode: GoogleSearchNode,
            WebSocketsNode: WebSocketsNode,
            DataExtractorNode: DataExtractorNode,
            PDFProcessorNode: PDFProcessorNode,
            SpreadsheetNode: SpreadsheetNode,
            DataValidationNode: DataValidationNode,
            GitNode: GitNode,
            GitHubNode: GitHubNode,
            GISNode: GISNode,
            DisplayImageNode: DisplayImageNode,
            ImageGalleryNode: ImageGalleryNode,
            HardwareInteractionNode: HardwareInteractionNode,
            SpeechSynthesisNode: SpeechSynthesisNode,
            MultimediaProcessingNode: MultimediaProcessingNode,
            RemoteExecutionNode: RemoteExecutionNode,
            StripeNode: StripeNode,
            HackerNewsNode: HackerNewsNode,
        };

        if (tools && Array.isArray(tools)) {
            tools.forEach(toolName => {
                if (toolMap[toolName]) {
                    availableTools[toolName.replace('Node', '').toLowerCase()] = new toolMap[toolName]();
                } else {
                    console.warn(`Tool ${toolName} not found or supported.`);
                }
            });
        }

        // For now, summarization LLM is the same as agent LLM
        const summarizeLLM = agentLLM; 

        const agent = new AgentNode(agentLLM, availableTools, summarizeLLM);
        agent.setParams({ goal, systemPrompt, maxIterations });

        console.log('[CustomAgentNode] Running agent with goal:', goal);
        const result = await agent.execAsync();
        console.log('[CustomAgentNode] Agent finished with result:', result);

        return result;
    }

    async postAsync(shared, prepRes, execRes) {
        shared.agentResult = execRes;
        return 'default';
    }
}