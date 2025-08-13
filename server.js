import express, { json } from 'express';
import cors from 'cors';
import { executeWorkflow, executeSingleNode, stopWorkflow } from './workflowExecutor.cjs';
import { stopWebhook } from './webhookRegistry.js';
import { WebSocketServer } from 'ws';

const app = express();
const port = 3000;

app.use(cors());
app.use(json());

const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

const wss = new WebSocketServer({ server });

const clients = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'register') {
      clients.set(data.workflowId, ws);
      console.log(`WebSocket client registered for workflow ${data.workflowId}`);
    }
  });

  ws.on('close', () => {
    for (const [workflowId, client] of clients.entries()) {
      if (client === ws) {
        clients.delete(workflowId);
        console.log(`WebSocket client unregistered for workflow ${workflowId}`);
        break;
      }
    }
  });
});

app.post('/run', async (req, res) => {
  const { nodes, edges, workflowId } = req.body;
  //console.log('Backend received nodes:', nodes); // THIS WILL APPEAR IN BACKEND TERMINAL
  try {
    // Register the WebSocket client with the workflowId immediately
    if (clients.has(workflowId)) {
      clients.get(workflowId).send(JSON.stringify({ type: 'log', message: 'WebSocket connected.' }));
    }
    const result = await executeWorkflow(nodes, edges, clients, workflowId);
    res.json(result); // executeWorkflow now returns { success, result/error, workflowId }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/stop-agent', (req, res) => {
  const { workflowId } = req.body;
  if (!workflowId) {
    return res.status(400).json({ success: false, error: 'workflowId is required.' });
  }
  try {
    const result = stopWorkflow(workflowId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/execute-node', async (req, res) => {
  const { nodeData } = req.body;
  try {
    const result = await executeSingleNode(nodeData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/stop-webhook', async (req, res) => {
  const { webhookId } = req.body;
  if (!webhookId) {
    return res.status(400).json({ success: false, error: 'webhookId is required.' });
  }
  try {
    await stopWebhook(webhookId);
    res.json({ success: true, message: `Webhook ${webhookId} stopped successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
