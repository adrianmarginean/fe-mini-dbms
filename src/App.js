import React, { useState } from 'react';
import './App.css'

const App = () => {
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState('');
  const [loading, setLoading] = useState(false);

  const executeQuery = async () => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/minidbms/executeSQL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: query
      });
      

      if (response.ok) {
       const data = await response.text(); // Response is expected to be text, not JSON
        setQueryResult(data);
      } else {
        setQueryResult('Error executing the query');
      }
    } catch (error) {
      setQueryResult('An error occurred while executing the query');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ backgroundColor: 'darkcyan', color: 'white', padding: '20px', textAlign: 'center', margin: '0' }}>
        Database Management System
      </h1>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '96%',
          height: '100px',
          padding: '10px',
          marginTop: '20px',
          fontSize: '16px',
          border: '1px solid #ccc',
        }}
        placeholder="Write your SQL query here"
        disabled={loading}
      ></textarea>
      <button
        onClick={executeQuery}
        style={{
          backgroundColor: 'darkcyan',
          color: 'white',
          padding: '10px',
          marginTop: '10px',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        disabled={loading}
      >
        {loading && <div className="loader"></div>}
        <span style={{ display: loading ? 'none' : 'block' }}>Execute Query</span>
      </button>
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', color: 'darkcyan' }}>
        <h3 style={{ marginBottom: '10px' }}>Result</h3>
        <div style={{ fontSize: '16px' }}>{queryResult}</div>
      </div>
    </div>
  );
};

export default App;
