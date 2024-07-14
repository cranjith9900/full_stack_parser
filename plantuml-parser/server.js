const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors module

const app = express();
const port = 5000;

app.use(bodyParser.text({ type: 'text/plain' }));

// Enable all CORS requests
app.use(cors());

function parseActivityDiagram(plantUmlText) {
  const nodes = new Set();
  const edges = [];

  const lines = plantUmlText.split('\n');
  let lastNode = null;

  lines.forEach(line => {
    line = line.trim();

    if (line.startsWith(':') && line.endsWith(';')) {
      // Activity
      const label = line.slice(1, -1).trim();
      const nodeId = label.replace(/\s+/g, '_');
      nodes.add({ id: nodeId, label });
      if (lastNode) {
        edges.push({ id: `e${edges.length + 1}`, source: lastNode, target: nodeId, label: '' });
      }
      lastNode = nodeId;
    } else if (line.startsWith('if ') || line.startsWith('endif')) {
      // Conditionals
      const conditionMatch = line.match(/if\s*\(([^)]+)\)/);
      if (conditionMatch) {
        const condition = conditionMatch[1].trim();
        const nodeId = condition.replace(/\s+/g, '_');
        nodes.add({ id: nodeId, label: condition });
        if (lastNode) {
          edges.push({ id: `e${edges.length + 1}`, source: lastNode, target: nodeId, label: '' });
        }
        lastNode = nodeId;
      }
    } else if (line.includes('->')) {
      // Transitions
      const transitionMatch = line.match(/(.+)\s*->\s*(.+)\s*:/);
      if (transitionMatch) {
        const [, from, to] = transitionMatch;
        const fromId = from.trim().replace(/\s+/g, '_');
        const toId = to.trim().replace(/\s+/g, '_');
        nodes.add({ id: fromId, label: from.trim() });
        nodes.add({ id: toId, label: to.trim() });
        edges.push({ id: `e${edges.length + 1}`, source: fromId, target: toId, label: '' });
      }
    }
  });

  return {
    nodes: Array.from(nodes),
    edges
  };
}

app.post('/parse', (req, res) => {
  const plantUmlText = req.body;
  console.log('Received PlantUML text:', plantUmlText);

  try {
    let parsedDiagram;
    
      parsedDiagram = parseActivityDiagram(plantUmlText);
   
    
    console.log('Parsed diagram:', parsedDiagram);
    res.json(parsedDiagram);
  } catch (error) {
    console.error('Error parsing PlantUML:', error);
    res.status(400).json({ error: 'Invalid PlantUML input' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
