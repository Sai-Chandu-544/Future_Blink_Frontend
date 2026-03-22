import React, { useState } from "react";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";

function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const nodes = [
    {
      id: "1",
      data: {
        label: (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter prompt"
          />
        ),
      },
      position: { x: 100, y: 100 },
    },
    {
      id: "2",
      data: { label: result || "Result here" },
      position: { x: 400, y: 100 },
    },
  ];

  const edges = [{ id: "e1-2", source: "1", target: "2" }];

  const runFlow = async () => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/ask-ai",
      { prompt: input }
    );

    console.log("SUCCESS:", res.data);

    setResult(res.data.result);

  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);

    setResult("Error fetching response");
  }
};
  console.log("The Result",result)

  const saveData = async () => {
    await axios.post("http://localhost:5000/api/save", {
      prompt: input,
      response: result,
    });

    alert("Saved!");
  };

  return (
    <div style={{ height: "100vh" }}>
      <button onClick={runFlow}>Run Flow</button>
      <button onClick={saveData}>Save</button>

      <ReactFlow nodes={nodes} edges={edges} />
    </div>
  );
}

export default App;