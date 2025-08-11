import express, { json } from 'express';
import cors from 'cors';
import { executeWorkflow } from './workflowExecutor.cjs';

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(json());

app.post('/run', async (req, res) => {
  const { nodes, edges } = req.body;
  try {
    const result = await executeWorkflow(nodes, edges);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
