import './App.css';
import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [detectedNumber, setDetectedNumber] = useState(null);
  const [finalNumber, setFinalNumber] = useState(""); 
  const [fromBase, setFromBase] = useState('10');
  const [toBase, setToBase] = useState('2');
  const [result, setResult] = useState(null);

  const handlePredict = async () => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('http://127.0.0.1:8000/predict', { method: 'POST', body: formData });
    const data = await response.json();
    setDetectedNumber(data.result);
    setFinalNumber(data.result);
    setResult(null);
  };

  const performConversion = () => {
    const decimalValue = parseInt(finalNumber, parseInt(fromBase));
    const converted = decimalValue.toString(parseInt(toBase));
    setResult(converted);
  };

  return (
    <div className="app-container">
      <h1>Smart Digit Converter</h1>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handlePredict}>Recognize</button>

      {detectedNumber && (
        <div className="result-box">
          <p>Detected Number: <strong>{detectedNumber}</strong></p>
          <input type="text" value={finalNumber} onChange={(e) => setFinalNumber(e.target.value)} />
          
          <div style={{ marginTop: '20px' }}>
            <label>From Base: </label>
            <select onChange={(e) => setFromBase(e.target.value)} value={fromBase}>
              <option value="2">2</option>
              <option value="8">8</option>
              <option value="10">10</option>
              <option value="16">16</option>
            </select>

            <label> To Base: </label>
            <select onChange={(e) => setToBase(e.target.value)} value={toBase}>
              <option value="2">2</option>
              <option value="8">8</option>
              <option value="10">10</option>
              <option value="16">16</option>
            </select>
          </div>

          <button onClick={performConversion} style={{ marginTop: '10px' }}>Convert!</button>

          {result && (
            <h2 style={{ color: 'green' }}>Result: {result}</h2>
          )}
        </div>
      )}
    </div>
  );
}

export default App;