import { AsyncFlow } from '../src/qflow.js';
import { CustomAgentNode } from '../src/qflowNodes/CustomAgentNode.js';
import { UserInputNode } from '@fractal-solutions/qflow';

// --- Configuration --- 
const OPENROUTER_API_KEY = process.env.OPEN_ROUTER_KEY;
const OPENROUTER_MODEL = process.env.OPEN_ROUTER_MODEL || 'openai/gpt-4o';

(async () => {
    if (!OPENROUTER_API_KEY) {
        console.warn("WARNING: OPENROUTER_API_KEY is not set. Please set it to run the Custom Agent example.");
        console.warn("You can get a token from https://openrouter.ai/settings/tokens");
        return;
    }

    console.log('--- Running Custom Agent Test Workflow ---');

    // 1. Node to get the goal from the user
    const getGoalNode = new UserInputNode();
    getGoalNode.setParams({ prompt: 'Please enter the agent\'s goal: ' });

    // 2. Instantiate the CustomAgentNode
    const customAgent = new CustomAgentNode();
    customAgent.setParams({
        provider: 'OpenRouter',
        apiKey: OPENROUTER_API_KEY,
        model: OPENROUTER_MODEL,
        systemPrompt: 'You are a helpful AI assistant.',
        goal: 'Find the current time in London and report it.',
        tools: ['DuckDuckGoSearchNode'], // Example: provide DuckDuckGo search tool
        maxIterations: 5,
        temperature: 0.7,
    });

    // The goal will be set dynamically from the UserInputNode's output
    customAgent.prepAsync = async (shared) => {
        customAgent.setParams({ goal: shared.userInput });
    };

    // 3. Chain the nodes: Get Goal -> CustomAgentNode
    getGoalNode.next(customAgent);

    // 4. Create and run the flow
    const customAgentFlow = new AsyncFlow(getGoalNode);

    try {
        const finalResult = await customAgentFlow.runAsync({});
        console.log('\n--- Custom Agent Test Workflow Finished ---');
        console.log('Final Agent Output:', finalResult);
    } catch (error) {
        console.error('\n--- Custom Agent Test Workflow Failed ---', error);
    }
})();