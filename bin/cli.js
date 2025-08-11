#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import open from 'open';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8888;

// Serve static files from dist directory
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 QFlow Studio is running at http://localhost:${PORT}`);
  console.log('📁 Serving built files from:', distPath);
  console.log('\n💡 To build the project first, run: npm run build');
  console.log('⭐ Access your workflows at the URL above\n');
  
  // Open browser automatically
  open(`http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down QFlow Studio server...');
  process.exit(0);
});