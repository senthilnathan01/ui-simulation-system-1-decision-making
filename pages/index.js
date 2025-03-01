import { useState, useEffect } from "react";
import { Simulation } from "../lib/simulation";

export default function Home() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trials, setTrials] = useState(100);
  const [speed, setSpeed] = useState(1000); // Default speed: 1 second per simulation
  const [simulationLogs, setSimulationLogs] = useState([]);

  const runSimulation = async () => {
    setLoading(true);
    setSimulationLogs([]);
    const sim = new Simulation();
    const logs = [];

    for (let i = 0; i < trials; i++) {
      sim.run(1); // Run one trial at a time
      logs.push(sim.logs[0]);
      setSimulationLogs([...logs]);
      await new Promise((resolve) => setTimeout(resolve, speed)); // Delay based on speed
    }

    setResults(sim.getResults());
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>UI Decision Simulation</h1>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Number of Trials:
          <input
            type="number"
            value={trials}
            onChange={(e) => setTrials(Number(e.target.value))}
            min="1"
            style={{ marginLeft: "10px" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Speed (ms per trial):
          <input
            type="number"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            min="100"
            style={{ marginLeft: "10px" }}
          />
        </label>
      </div>

      <button
        onClick={runSimulation}
        disabled={loading}
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        {loading ? "Running..." : "Run Simulation"}
      </button>

      {results && (
        <div style={{ marginTop: "20px" }}>
          <h2>Results</h2>
          <p>Login: {results.login.toFixed(1)}%</p>
          <p>Search: {results.search.toFixed(1)}%</p>
          <p>Help: {results.help.toFixed(1)}%</p>
          <p>Exit: {results.exit.toFixed(1)}%</p>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <h2>Simulation Logs</h2>
        <div style={{ height: "200px", overflowY: "scroll", border: "1px solid #ccc", padding: "10px" }}>
          {simulationLogs.map((log, index) => (
            <div key={index} style={{ marginBottom: "5px" }}>
              <strong>Trial {index + 1}:</strong> Cursor at ({log.cursor[0].toFixed(1)}, {log.cursor[1].toFixed(1)}) → Chose {log.choice}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
