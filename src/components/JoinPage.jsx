import React, { useState, useEffect } from "react";
import axios from "axios";

const JoinPage = () => {
  const [table1, setTable1] = useState("");
  const [table2, setTable2] = useState("");
  const [columns1, setColumns1] = useState([]);
  const [columns2, setColumns2] = useState([]);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedColumn1, setSelectedColumn1] = useState(null);
  const [selectedColumn2, setSelectedColumn2] = useState(null);
  const [joinColumns1, setJoinColumns1] = useState([]);
  const [joinColumns2, setJoinColumns2] = useState([]);
  const [queryResult, setQueryResult] = useState([]);
  const [queryExecuting, setQueryExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);

  useEffect(() => {
    // Fetch the list of tables when the component mounts
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get("http://localhost:8080/minidbms/tables");
      setTables(response.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  const fetchColumns = async (tableName, setColumns, setLoading) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/minidbms/columns/${tableName}`);
      setColumns(response.data);
    } catch (error) {
      console.error(`Error fetching columns for table ${tableName}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinColumns = async (tableName, setJoinColumns) => {
    try {
      const response = await axios.get(`http://localhost:8080/minidbms/joinColumns/${tableName}`);
      setJoinColumns(response.data);
    } catch (error) {
      console.error(`Error fetching join columns for table ${tableName}:`, error);
    }
  };

  const handleColumnSelection = (selected, setSelectedColumn) => {
    setSelectedColumn(selected);
  };

  const handleTableSelection = (selectedTable, setTable, setColumns, setLoading, setJoinColumns) => {
    setTable(selectedTable);
    setJoinColumns([]);
    fetchColumns(selectedTable, setColumns, setLoading);
    fetchJoinColumns(selectedTable, setJoinColumns);
  };

  const generateJoinQuery = () => {
    if (table1 && table2 && selectedColumn1 && selectedColumn2) {
      let query = `SELECT * FROM ${table1} INNER JOIN ${table2} ON ${table1}.${selectedColumn1} = ${table2}.${selectedColumn2};`;
      return query;
    }
    return "";
  };

  const runQuery = async () => {
    setQueryExecuting(true);

    try {
      const startTime = performance.now();
      const response = await axios.post("http://localhost:8080/minidbms/join", {
        leftTable: table1,
        database: "students",
        rightTable: table2,
        leftJoinColumn: selectedColumn1,
        rightJoinColumn: selectedColumn2,
      });

      const endTime = performance.now();
      setExecutionTime(endTime - startTime);

      setQueryResult(response.data);
    } catch (error) {
      console.error("Error executing query:", error);
    } finally {
      setQueryExecuting(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h2>Join Page</h2>

      <div>
        <label>
          Select Left Table:
          <select value={table1} onChange={(e) => handleTableSelection(e.target.value, setTable1, setColumns1, setLoading1, setJoinColumns1)}>
            <option value="">Select a table</option>
            {tables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
        </label>

        {columns1.length > 0 && (
          <div>
            <h3>Left Join Column from:  {table1}</h3>
            <select
              value={selectedColumn1}
              onChange={(e) => handleColumnSelection(e.target.value, setSelectedColumn1)}
            >
              <option value="">Select a column</option>
              {columns1.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>
        )}

        {joinColumns1.length > 0 && (
          <div>
            <h3>Join Columns for {table1}</h3>
            <select
              value={selectedColumn1}
              onChange={(e) => handleColumnSelection(e.target.value, setSelectedColumn1)}
            >
              <option value="">Select a join column</option>
              {joinColumns1.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label>
          Select Right Table:
          <select value={table2} onChange={(e) => handleTableSelection(e.target.value, setTable2, setColumns2, setLoading2, setJoinColumns2)}>
            <option value="">Select a table</option>
            {tables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
        </label>

        {columns2.length > 0 && (
          <div>
            <h3>Right Join Column from: {table2}</h3>
            <select
              value={selectedColumn2}
              onChange={(e) => handleColumnSelection(e.target.value, setSelectedColumn2)}
            >
              <option value="">Select a column</option>
              {columns2.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>
        )}

        {joinColumns2.length > 0 && (
          <div>
            <h3>Join Columns for {table2}</h3>
            <select
              value={selectedColumn2}
              onChange={(e) => handleColumnSelection(e.target.value, setSelectedColumn2)}
            >
              <option value="">Select a join column</option>
              {joinColumns2.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <h3>Generated Query</h3>
        <pre>{generateJoinQuery()}</pre>
      </div>

      <div>
        <button onClick={runQuery} disabled={!table1 || !table2 || !selectedColumn1 || !selectedColumn2 || queryExecuting}>
          Run Query
        </button>
      </div>

      {queryExecuting && <p>Executing query...</p>}

      {executionTime !== null && <p>Execution Time: {executionTime} ms</p>}

      {queryResult.headers && queryResult.rows && (
        <div>
          <h3>Query Result</h3>
          <table border="1">
            <thead>
              <tr>
                {queryResult.headers.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queryResult.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, columnIndex) => (
                    <td key={queryResult.headers[columnIndex]}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default JoinPage;
