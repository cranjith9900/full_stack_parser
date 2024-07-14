const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;

app.use(bodyParser.json());

// Helper function to parse PlantUML content
function parsePlantUML(content) {
  const nodes = [];
  const edges = [];
  let currentNodeId = 1;

  function generateNodeId() {
    return `Node_${currentNodeId++}`;
  }

  const lines = content.split('\n');
  let inRepeatLoop = false;
  let repeatStartNode = null;
  let lastNodeId = null;

  lines.forEach((line, index) => {
    line = line.trim();

    if (line === 'start') {
      const nodeId = generateNodeId();
      nodes.push({ id: nodeId, data: { label: 'Start' }, position: { x: 100, y: 100 } });
      lastNodeId = nodeId;
    } else if (line === 'stop') {
      const nodeId = generateNodeId();
      nodes.push({ id: nodeId, data: { label: 'Stop' }, position: { x: 200, y: 200 } });
      edges.push({ id: `e${edges.length + 1}`, source: lastNodeId, target: nodeId, label: '' });
    } else if (line.startsWith('repeat')) {
      inRepeatLoop = true;
      repeatStartNode = lastNodeId;
    } else if (line.startsWith('repeat while')) {
      inRepeatLoop = false;
      const nodeId = generateNodeId();
      const condition = line.match(/\((.*?)\)/)[1];
      nodes.push({ id: nodeId, data: { label: `Condition: ${condition}` }, position: { x: 300, y: 300 } });
      edges.push({ id: `e${edges.length + 1}`, source: lastNodeId, target: nodeId, label: '' });
      edges.push({ id: `e${edges.length + 1}`, source: nodeId, target: repeatStartNode, label: 'yes' });
    } else if (line.startsWith(':')) {
      const nodeId = generateNodeId();
      const label = line.slice(1, -1).trim();
      nodes.push({ id: nodeId, data: { label }, position: { x: 400, y: 400 } });
      if (lastNodeId) {
        edges.push({ id: `e${edges.length + 1}`, source: lastNodeId, target: nodeId, label: '' });
      }
      lastNodeId = nodeId;
    }
  });

  return { nodes, edges };
}

// API endpoint to parse PlantUML content
app.post('/parse', (req, res) => {
  const { plantuml } = req.body;
  if (!plantuml) {
    return res.status(400).send('No PlantUML content provided');
  }

  const result = parsePlantUML(plantuml);
  res.json(result);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
