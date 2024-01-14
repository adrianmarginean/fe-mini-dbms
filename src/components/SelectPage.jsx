import React, { useState, useEffect } from "react";
import axios from "axios";

const SelectPage = () => {
  const [tableName, setTableName] = useState("");
  const [tableColumns, setTableColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [distinct, setDistinct] = useState(false);
  const [whereConditions, setWhereConditions] = useState([]);
  const [queryResult, setQueryResult] = useState([]);
  const [queryExecuting, setQueryExecuting] = useState(false);

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

  const fetchColumns = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/minidbms/columns/${tableName}`);
      setTableColumns(response.data);
    } catch (error) {
      console.error(`Error fetching columns for table ${tableName}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleColumnSelection = (selected) => {
    setSelectedColumns(selected);
  };

  const addWhereCondition = () => {
    setWhereConditions([...whereConditions, { column: "", operation: "=", value: "" }]);
  };

  const updateWhereCondition = (index, field, value) => {
    const updatedConditions = [...whereConditions];
    updatedConditions[index][field] = value;
    setWhereConditions(updatedConditions);
  };

  const removeWhereCondition = (index) => {
    const updatedConditions = [...whereConditions];
    updatedConditions.splice(index, 1);
    setWhereConditions(updatedConditions);
  };

  const generateSelectQuery = () => {
    if (tableName && selectedColumns.length > 0) {
      const selectedColumnsString = selectedColumns.includes("*")
        ? "*"
        : selectedColumns.join(", ");

      let query = `SELECT ${distinct ? "DISTINCT " : ""}${selectedColumnsString} FROM ${tableName}`;

      if (whereConditions.length > 0) {
        const whereClause = whereConditions
          .map((condition) => `${condition.column} ${condition.operation} ${condition.value}`)
          .join(" AND ");

        query += ` WHERE ${whereClause}`;
      }

      query += ";";

      return query;
    }
    return "";
  };

  const runQuery = async () => {
    setQueryExecuting(true);

    try {
      const response = await axios.post("http://localhost:8080/minidbms/select", {
        columns: selectedColumns[0] === "*" ? tableColumns : selectedColumns,
        condition: whereConditions.length === 0 ? "" : generateSelectQuery().split("WHERE")[1].slice(0, -1),
        table: tableName,
        database: "students", // Provide the actual database name here
      }, {
        headers: {
          'Content-Type': 'application/json',
          // Remove 'Access-Control-Allow-Origin' header from the client side
        },
      });

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
      <h2>Select Page</h2>

      <label>
        Select Table:
        <select value={tableName} onChange={(e) => setTableName(e.target.value)}>
          <option value="">Select a table</option>
          {tables.map((table) => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </select>
      </label>

      <button onClick={fetchColumns} disabled={!tableName}>
        Fetch Columns
      </button>

      {loading && <p>Loading...</p>}

      {tableColumns.length > 0 && (
        <div>
          <h3>Columns for {tableName}</h3>
          <select
            multiple
            value={selectedColumns}
            onChange={(e) =>
              handleColumnSelection(Array.from(e.target.selectedOptions, (option) => option.value))
            }
          >
            <option value="*">All Columns (*)</option>
            {tableColumns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>

          <label>
            <input type="checkbox" checked={distinct} onChange={() => setDistinct(!distinct)} />
            Distinct
          </label>

          <div>
            <h3>Where Conditions</h3>
            {whereConditions.map((condition, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <select
                  value={condition.column}
                  onChange={(e) => updateWhereCondition(index, "column", e.target.value)}
                >
                  <option value="">Select a column</option>
                  {tableColumns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>

                <select
                  value={condition.operation}
                  onChange={(e) => updateWhereCondition(index, "operation", e.target.value)}
                >
                  <option value="=">=</option>
                  <option value="<">{"<"}</option>
                  <option value=">">{">"}</option>
                  {/* Add more operations as needed */}
                </select>

                <input
                  type="text"
                  value={condition.value}
                  onChange={(e) => updateWhereCondition(index, "value", e.target.value)}
                />

                <button onClick={() => removeWhereCondition(index)}>Remove</button>
              </div>
            ))}

            <button onClick={addWhereCondition}>Add Condition</button>
          </div>

          <div>
            <h3>Generated Query</h3>
            <pre>{generateSelectQuery()}</pre>
          </div>

          <button onClick={runQuery} disabled={!tableName || queryExecuting}>
            Run Query
          </button>

          {queryExecuting && <p>Executing query...</p>}

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
      )}
    </div>
  );
};

export default SelectPage;
