<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UI Decision Simulation</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>UI Decision Simulation</h1>
        <div class="main-content">
            <div class="left-pane">
                <div class="controls">
                    <label for="trialCount">Number of Trials:</label>
                    <input type="number" id="trialCount" value="10" min="1" max="100">
                    <label for="speed">Speed (ms per trial):</label>
                    <input type="number" id="speed" value="1000" min="100" max="5000">
                    <button id="startBtn">Start Simulation</button>
                    <button id="resetBtn">Reset</button>
                </div>
                <div class="element-controls">
                    <h3>Configure UI Elements</h3>
                    <div id="elementConfig"></div>
                </div>
                <canvas id="simulationCanvas" width="500" height="500"></canvas>
                <div id="results"></div>
            </div>
            <div class="right-pane">
                <div id="logPane">
                    <h3>Simulation Logs</h3>
                </div>
                <div class="info">
                    <h3>Info</h3>
                    <p>Heuristic Weights:</p>
                    <ul>
                        <li>Salience: 50%</li>
                        <li>Proximity: 20%</li>
                        <li>Color: 30%</li>
                    </ul>
                    <p>Color Weights:</p>
                    <ul>
                        <li>Green: 0.8 (Positive)</li>
                        <li>Yellow: 0.4 (Neutral)</li>
                        <li>Gray: 0.3 (Neutral)</li>
                        <li>Red: 0.1 (Negative)</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <script src="simulation.js"></script>
</body>
</html>
