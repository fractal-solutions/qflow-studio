import express, { json } from 'express';
import cors from 'cors';
import { executeWorkflow, executeSingleNode } from './workflowExecutor.cjs';
import { stopWebhook } from './webhookRegistry.js';

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(json());

app.post('/run', async (req, res) => {
  const { nodes, edges } = req.body;
  //console.log('Backend received nodes:', nodes); // THIS WILL APPEAR IN BACKEND TERMINAL
  try {
    const result = await executeWorkflow(nodes, edges);
    res.json(result); // executeWorkflow now returns { success, result/error }
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
