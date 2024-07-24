import React, { useState } from 'react';
import axios from 'axios';

const PlantUMLInput = () => {
  const [plantUMLCode, setPlantUMLCode] = useState('');
  const [graphData, setGraphData] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setPlantUMLCode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/generate-graph', plantUMLCode, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      setGraphData(response.data);
    } catch (err) {
      setError('Error generating graph. Please check your PlantUML code and try again.');
      console.error(err);
    }
  };

  return (
    <div>
      <h1>PlantUML to Graph</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={plantUMLCode}
          onChange={handleChange}
          rows="10"
          cols="50"
          placeholder="Enter PlantUML code here"
        ></textarea>
        <br />
        <button type="submit">Generate Graph</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {graphData && (
        <div>
          <h2>Generated Graph Data</h2>
          <pre>{JSON.stringify(graphData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default PlantUMLInput;
