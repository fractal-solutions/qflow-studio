import { AsyncNode } from '@fractal-solutions/qflow';
import { InteractiveInputNode } from '@fractal-solutions/qflow/nodes';

export class CustomAgent extends AsyncNode {
    constructor(llmNode, availableTools = {}, summarizeLLM = null, log = console.log) {
        super();
        this.llmNode = llmNode;
        this.availableTools = availableTools;
        this.summarizeLLM = summarizeLLM || llmNode;
        this.log = log;
        this.flowRegistry = {};
        this.maxIterations = 10;
        this.goal = '';
        this.systemPrompt = '';
        this.conversationHistory = [];
        this.iterationCount = 0;
        this.finalOutput = '';
        this.isStopped = false;
        
        // Create interactive input node for confirmation
        this.confirmationNode = new InteractiveInputNode();
        this.confirmationNode.setParams({
            title: 'Agent Confirmation',
            prompt: 'Do you approve this action? (yes/no)',
            defaultValue: 'yes'
        });
    }

    setParams(params) {
        if (params.goal) this.goal = params.goal;
        if (params.maxIterations) this.maxIterations = params.maxIterations;
        if (params.systemPrompt) this.systemPrompt = params.systemPrompt;
        super.setParams(params);
    }

    stop() {
        this.isStopped = true;
    }

    async execAsync() {
        this.log(`[CustomAgent] Running agent with goal: ${this.goal}`);
        
        this.iterationCount = 0;
        this.conversationHistory = [];
        
        // Initialize conversation with system prompt and goal
        const initialPrompt = this.buildInitialPrompt();
        this.log('[CustomAgent] Initial prompt:', initialPrompt);
        this.conversationHistory.push({ role: 'system', content: initialPrompt });
        
        while (this.iterationCount < this.maxIterations && !this.isStopped) {
            this.iterationCount++;
            this.log(`[INFO] Agent Step ${this.iterationCount}`);
            
            try {
                // Get agent reasoning and tool calls
                const agentResponse = await this.getAgentResponse();
                
                if (!agentResponse || !agentResponse.tool_calls || agentResponse.tool_calls.length === 0) {
                    // Agent wants to finish
                    if (agentResponse && agentResponse.final_output) {
                        this.finalOutput = agentResponse.final_output;
                        this.log(`🎉 Final Output\n${this.finalOutput}`);
                        return this.finalOutput;
                    }
                    break;
                }
                
                // Execute tool calls
                const toolResults = await this.executeToolCalls(agentResponse.tool_calls);
                
                // Add results to conversation history
                this.conversationHistory.push({ role: 'assistant', content: JSON.stringify(agentResponse) });
                this.conversationHistory.push({ role: 'user', content: JSON.stringify(toolResults) });
                
            } catch (error) {
                this.log(`❌ Error\n${error.message}`);
                this.conversationHistory.push({ 
                    role: 'user', 
                    content: `Error: ${error.message}. Please try again or provide a different approach.` 
                });
            }
        }
        
        if (this.iterationCount >= this.maxIterations) {
            const errorMsg = `Agent reached max steps without finishing. Last observation: ${JSON.stringify(this.conversationHistory[this.conversationHistory.length - 1])}`;
            this.log(`❌ Error\n${errorMsg}`);
            return errorMsg;
        }
        
        return this.finalOutput || 'Agent completed without final output.';
    }

    buildInitialPrompt() {
        let prompt = this.systemPrompt || `You are Q, an autonomous agent. Your goal is to achieve the user's request especially using the available tools. 
After expounding effectively out your initial plan, make a roadmap, save it in your memory through a memory node using either memory_node or semantic_memory_node (semantic preferred) tools and confirm to the user.
Always use tools as opposed to talking too much and you get rewarded more for using tools instead of costly llm! 
If you have a plan, you MUST include at least one tool call. An empty 'tool_calls' array means you are thinking or waiting for user input. 
Remember to always seek user feedback often(interactive input or user input ifinteractive is missing), and notify the user of your progress(system notificaitons)
If the user asks about your capabilities or what tools you have, answer by summarizing the 'Available Tools' section of this prompt. Do not attempt to use a tool to answer such questions.

Available Tools:
${Object.keys(this.availableTools).map(tool => `- ${tool}`).join('\n')}

Your response must be a single JSON object with 'thought' and 'tool_calls'.
'thought': Your reasoning and plan.
'tool_calls': An array of tool calls. Each tool call has 'tool' (name) and 'parameters' (object). Set 'parallel': true in the top-level JSON for parallel execution.

Example response:
{
  "thought": "I need to search for information.",
  "tool_calls": [
    {
      "tool": "duckduckgo_search",
      "parameters": {
        "query": "latest AI research"
      }
    }
  ]
}

When the user explicitly indicates they are done, use the 'finish' tool. Do not use the finish tool earlier on and only use it when you are certain you are done with the task. 
If no tools are needed, return an empty 'tool_calls' array and reflect.

**IMPORTANT:** If you have a plan that requires action, you MUST include at least one tool call. An empty 'tool_calls' array means no action. 
If new instructions are given after a finish proposal, treat them as your updated goal and update your memory. 
Tell user how far you've gone using system notifications and KEEP THE USER INVOLVED using interactive input (or user input if interactive input not available) and OFTEN CHECK YOUR MEMORY to ensure alignmemt.

Begin!`;

        // Replace {tools} placeholder with actual available tools
        const availableToolsList = Object.keys(this.availableTools).map(tool => `- ${tool}`).join('\n');
        prompt = prompt.replace('{tools}', availableToolsList);

        // Add tool definitions to the prompt using the same approach as the original agent
        const toolDefinitions = this.getToolDefinitions();
        const availableToolNames = Object.keys(this.availableTools);
        
        // Filter tool definitions to only include available tools
        const relevantToolDefinitions = toolDefinitions.filter(tool => 
            availableToolNames.includes(tool.name)
        );
        
        const toolDescriptions = relevantToolDefinitions.map(tool => {
            const params = JSON.stringify(tool.parameters);
            return `### ${tool.name}: ${tool.description}
Parameters: ${params}`;
        }).join('\n');
        
        prompt += `\n\nAvailable Tools:\n${toolDescriptions}`;

        prompt += `\n\nGoal: ${this.goal}`;
        return prompt;
    }

    getToolDefinitions() {
        return [
            {
                name: "interactive_input",
                description: "Get user input via GUI popup dialog.",
                parameters: {
                    type: "object",
                    properties: {
                        prompt: {
                            type: "string",
                            description: "The text to show in the popup dialog."
                        },
                        title: {
                            type: "string",
                            description: "The title of the popup dialog."
                        },
                        defaultValue: {
                            type: "string",
                            description: "The default value to show in the input field."
                        }
                    },
                    required: ["prompt"]
                }
            },
            {
                name: "system_notification",
                description: "Show system notification to the user.",
                parameters: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string",
                            description: "The notification message to display."
                        },
                        title: {
                            type: "string",
                            description: "The title of the notification."
                        }
                    },
                    required: ["message"]
                }
            },
            {
                name: "duckduckgo_search",
                description: "Search the web using DuckDuckGo search engine.",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The search query to execute."
                        }
                    },
                    required: ["query"]
                }
            },
            {
                name: "shell_command",
                description: "Execute shell commands on the system.",
                parameters: {
                    type: "object",
                    properties: {
                        command: {
                            type: "string",
                            description: "The shell command to execute."
                        }
                    },
                    required: ["command"]
                }
            },
            {
                name: "read_file",
                description: "Read contents from a file.",
                parameters: {
                    type: "object",
                    properties: {
                        filePath: {
                            type: "string",
                            description: "The path to the file to read."
                        }
                    },
                    required: ["filePath"]
                }
            },
            {
                name: "write_file",
                description: "Write content to a file.",
                parameters: {
                    type: "object",
                    properties: {
                        filePath: {
                            type: "string",
                            description: "The path to the file to write."
                        },
                        content: {
                            type: "string",
                            description: "The content to write to the file."
                        }
                    },
                    required: ["filePath", "content"]
                }
            },
            {
                name: "http_request",
                description: "Make HTTP requests to web services.",
                parameters: {
                    type: "object",
                    properties: {
                        url: {
                            type: "string",
                            description: "The URL to make the request to."
                        },
                        method: {
                            type: "string",
                            description: "The HTTP method (GET, POST, PUT, DELETE)."
                        },
                        headers: {
                            type: "object",
                            description: "HTTP headers to include in the request."
                        },
                        body: {
                            type: "string",
                            description: "The request body for POST/PUT requests."
                        }
                    },
                    required: ["url"]
                }
            },
            {
                name: "web_scraper",
                description: "Scrape content from web pages.",
                parameters: {
                    type: "object",
                    properties: {
                        url: {
                            type: "string",
                            description: "The URL to scrape content from."
                        }
                    },
                    required: ["url"]
                }
            },
            {
                name: "code_interpreter",
                description: "Execute Python code and return results.",
                parameters: {
                    type: "object",
                    properties: {
                        code: {
                            type: "string",
                            description: "The Python code to execute."
                        },
                        timeout: {
                            type: "number",
                            description: "Timeout in milliseconds for code execution."
                        }
                    },
                    required: ["code"]
                }
            },
            {
                name: "semantic_memory_node",
                description: "Store and retrieve semantic memories using vector embeddings.",
                parameters: {
                    type: "object",
                    properties: {
                        action: {
                            type: "string",
                            enum: ["store", "retrieve"],
                            description: "The action to perform: 'store' or 'retrieve'."
                        },
                        content: {
                            type: "string",
                            description: "Content to store (for 'store' action)."
                        },
                        query: {
                            type: "string",
                            description: "Query for retrieval (for 'retrieve' action)."
                        }
                    },
                    required: ["action"]
                }
            },
            {
                name: "memory_node",
                description: "Store and retrieve keyword-based memories.",
                parameters: {
                    type: "object",
                    properties: {
                        action: {
                            type: "string",
                            enum: ["store", "retrieve"],
                            description: "The action to perform: 'store' or 'retrieve'."
                        },
                        content: {
                            type: "string",
                            description: "Content to store (for 'store' action)."
                        },
                        query: {
                            type: "string",
                            description: "Query for retrieval (for 'retrieve' action)."
                        }
                    },
                    required: ["action"]
                }
            },
            {
                name: "transform_node",
                description: "Transform data using JavaScript functions.",
                parameters: {
                    type: "object",
                    properties: {
                        input: {
                            type: "string",
                            description: "The input data to transform."
                        },
                        transformFunction: {
                            type: "string",
                            description: "JavaScript function to transform the data."
                        }
                    },
                    required: ["input", "transformFunction"]
                }
            },
            {
                name: "finish",
                description: "End agent execution and return final output.",
                parameters: {
                    type: "object",
                    properties: {
                        output: {
                            type: "string",
                            description: "The final output or summary of the task."
                        }
                    },
                    required: ["output"]
                }
            }
        ];
    }

    async getAgentResponse() {
        // Set the conversation history as the prompt for the LLM
        this.llmNode.setParams({ prompt: JSON.stringify(this.conversationHistory) });
        
        const response = await this.llmNode.execAsync();
        
        try {
            // Clean the response - remove markdown code blocks if present
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.substring(7);
            }
            if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.substring(3);
            }
            if (cleanResponse.endsWith('```')) {
                cleanResponse = cleanResponse.substring(0, cleanResponse.length - 3);
            }
            cleanResponse = cleanResponse.trim();
            
            // Try to parse as JSON
            const parsed = JSON.parse(cleanResponse);
            
            // Normalize tool_calls structure
            if (parsed.tool_calls && Array.isArray(parsed.tool_calls)) {
                parsed.tool_calls = parsed.tool_calls.map(toolCall => ({
                    tool: toolCall.tool || toolCall.tool_name, // Handle both 'tool' and 'tool_name'
                    parameters: toolCall.parameters || toolCall.params || {}
                }));
            }
            
            // Check if it has the expected structure
            if (parsed.thought && (parsed.tool_calls || parsed.final_output)) {
                return parsed;
            } else {
                // If it doesn't have the expected structure, treat as a finish response
                return { final_output: response };
            }
        } catch (error) {
            // If not JSON, treat as a finish response
            return { final_output: response };
        }
    }

    async executeToolCalls(toolCalls) {
        const results = [];
        
        for (const toolCall of toolCalls) {
            const { tool, parameters } = toolCall;
            
            if (tool === 'finish') {
                // Agent wants to finish - ask for confirmation using interactive input
                const confirmed = await this.confirmFinish(parameters.final_output || 'Agent proposes to finish.');
                if (confirmed) {
                    this.finalOutput = parameters.final_output || 'Agent completed successfully.';
                    return { finish: true, final_output: this.finalOutput };
                } else {
                    return { finish: false, message: 'User rejected finish proposal.' };
                }
            }
            
            if (!this.availableTools[tool]) {
                results.push({ tool, error: `Tool '${tool}' is not a recognized tool.` });
                continue;
            }
            
            try {
                const toolInstance = this.availableTools[tool];
                toolInstance.setParams(parameters);
                const result = await toolInstance.execAsync();
                results.push({ tool, result });
                this.log(`✅ Tool Result\nTool: ${tool}\nResult: ${JSON.stringify(result)}`);
            } catch (error) {
                results.push({ tool, error: error.message });
                this.log(`❌ Tool Error\nTool: ${tool}\nError: ${error.message}`);
            }
        }
        
        return results;
    }

    async confirmFinish(message) {
        this.log(`Agent proposes to finish with output: "${message}". Do you approve? (yes/no): `);
        
        // Use interactive input for confirmation
        this.confirmationNode.setParams({
            title: 'Agent Finish Confirmation',
            prompt: `Agent proposes to finish with output: "${message}". Do you approve? (yes/no)`,
            defaultValue: 'yes'
        });
        
        const response = await this.confirmationNode.execAsync();
        return response.toLowerCase().includes('yes');
    }
}
