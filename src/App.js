import React, { useState } from "react";
import QueryDesigner from "./components/QueryDesigner";
import SelectPage from "./components/SelectPage";
import "./App.css";

const App = () => {
  const [selectedOption, setSelectedOption] = useState("query");

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h1
        style={{
          backgroundColor: "darkcyan",
          color: "white",
          padding: "20px",
          textAlign: "center",
          margin: "0",
        }}
      >
        Database Management System
      </h1>

      <div style={{ marginTop: "4px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          Select Editor:
        </label>
        <select
          value={selectedOption}
          onChange={(e) => handleOptionChange(e.target.value)}
          style={{ width: "100%", padding: "8px", fontSize: "16px" }}
        >
          <option value="query">Query Panel</option>
          <option value="select">Select Query</option>
        </select>
      </div>

      {selectedOption === "query" && <QueryDesigner />}

      {selectedOption === "select" && <SelectPage />}
    </div>
  );
};

export default App;
