// public/simulation.js
class SimulationConfig {
    constructor() {
        this.elements = [
            { name: "Login", prominence: 9, pos: [50, 50], color: "green", size: [15, 7] },
            { name: "Search", prominence: 7, pos: [50, 80], color: "yellow", size: [20, 7] },
            { name: "Help", prominence: 5, pos: [10, 80], color: "gray", size: [10, 10] },
            { name: "Exit", prominence: 3, pos: [90, 90], color: "red", size: [8, 8] }
        ];
        this.gridSize = [100, 100];
        this.heuristicWeights = { salience: 0.5, proximity: 0.2, color: 0.3 };
        this.colorWeights = { green: 0.8, yellow: 0.4, gray: 0.3, red: 0.1 };
    }
}

class UISimulation {
    constructor(config) {
        this.config = config;
        this.logs = [];
        this.simulations = []; // Store completed simulation results
        this.canvas = document.getElementById("simulationCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.trialCount = 0;
        this.speed = 1000;
        this.running = false;
        this.setupElementControls();
        this.setupDragging();
        this.drawUI();
        this.setupLogPane();
    }

    calculateDistance(pos1, pos2) {
        return Math.sqrt((pos1[0] - pos2[0]) ** 2 + (pos1[1] - pos2[1]) ** 2);
    }

    calculateScores(cursor) {
        const scores = [];
        for (const elem of this.config.elements) {
            const dist = this.calculateDistance(elem.pos, cursor);
            const proximityScore = 100 / (dist + 0.1);
            const colorScore = this.config.colorWeights[elem.color] || 0.5;
            const salienceScore = elem.prominence / 10;
            const total = (
                this.config.heuristicWeights.salience * salienceScore +
                this.config.heuristicWeights.proximity * proximityScore +
                this.config.heuristicWeights.color * colorScore
            );
            scores.push([elem, total]);
        }
        return scores;
    }

    drawUI(elements = this.config.elements) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const scaleX = this.canvas.width / this.config.gridSize[0];
        const scaleY = this.canvas.height / this.config.gridSize[1];

        for (const elem of elements) {
            const [x, y] = elem.pos;
            const [w, h] = elem.size;
            this.ctx.fillStyle = elem.color;
            this.ctx.fillRect((x - w / 2) * scaleX, (y - h / 2) * scaleY, w * scaleX, h * scaleY);
            this.ctx.strokeStyle = "black";
            this.ctx.strokeRect((x - w / 2) * scaleX, (y - h / 2) * scaleY, w * scaleX, h * scaleY);
            this.ctx.fillStyle = "black";
            this.ctx.font = "12px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText(elem.name, x * scaleX, y * scaleY + 4);
        }
    }

    async animateCursor(cursor, targetPos) {
        const scaleX = this.canvas.width / this.config.gridSize[0];
        const scaleY = this.canvas.height / this.config.gridSize[1];
        const startX = cursor[0] * scaleX;
        const startY = cursor[1] * scaleY;
        const endX = targetPos[0] * scaleX;
        const endY = targetPos[1] * scaleY;
        const steps = 20; // Animation steps
        const dx = (endX - startX) / steps;
        const dy = (endY - startY) / steps;

        for (let i = 0; i <= steps; i++) {
            this.drawUI();
            const x = startX + dx * i;
            const y = startY + dy * i;
            this.ctx.fillStyle = "blue";
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - 10);
            this.ctx.lineTo(x - 5, y + 5);
            this.ctx.lineTo(x + 5, y + 5);
            this.ctx.closePath();
            this.ctx.fill();
            await new Promise(resolve => setTimeout(resolve, this.speed / steps / 2));
        }
    }

    updateResults() {
        const choices = this.logs.map(log => log.choice);
        const total = choices.length;
        const stats = {};
        for (const elem of this.config.elements) {
            stats[elem.name] = Math.round((choices.filter(c => c === elem.name).length / total) * 100) || 0;
        }
        const successRate = stats["Login"];
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = `
            <strong>Results:</strong><br>
            Login: ${stats["Login"]}% | Search: ${stats["Search"]}% | Help: ${stats["Help"]}% | Exit: ${stats["Exit"]}%<br>
            Trials completed: ${total}${total >= this.trialCount && total > 0 ? `<br><strong>Success Rate (Login): ${successRate}%</strong>` : ""}
        `;
        return { stats, successRate, total };
    }

    setupElementControls() {
        const configDiv = document.getElementById("elementConfig");
        configDiv.innerHTML = "";
        this.config.elements.forEach(elem => {
            const div = document.createElement("div");
            div.innerHTML = `
                ${elem.name}: 
                <select id="color-${elem.name}">
                    <option value="green" ${elem.color === "green" ? "selected" : ""}>Green</option>
                    <option value="yellow" ${elem.color === "yellow" ? "selected" : ""}>Yellow</option>
                    <option value="gray" ${elem.color === "gray" ? "selected" : ""}>Gray</option>
                    <option value="red" ${elem.color === "red" ? "selected" : ""}>Red</option>
                </select>
            `;
            configDiv.appendChild(div);
            document.getElementById(`color-${elem.name}`).addEventListener("change", (e) => {
                elem.color = e.target.value;
                this.drawUI();
            });
        });
    }

    setupDragging() {
        let draggedElement = null;
        const scaleX = this.config.gridSize[0] / this.canvas.width;
        const scaleY = this.config.gridSize[1] / this.canvas.height;

        this.canvas.addEventListener("mousedown", (e) => {
            if (this.running) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            draggedElement = this.config.elements.find(elem => {
                const [ex, ey] = elem.pos;
                const [w, h] = elem.size;
                return x >= ex - w / 2 && x <= ex + w / 2 && y >= ey - h / 2 && y <= ey + h / 2;
            });
        });

        this.canvas.addEventListener("mousemove", (e) => {
            if (draggedElement && !this.running) {
                const rect = this.canvas.getBoundingClientRect();
                const x = (e.clientX - rect.left) * scaleX;
                const y = (e.clientY - rect.top) * scaleY;
                draggedElement.pos = [Math.max(0, Math.min(x, this.config.gridSize[0])), Math.max(0, Math.min(y, this.config.gridSize[1]))];
                this.drawUI();
            }
        });

        this.canvas.addEventListener("mouseup", () => {
            draggedElement = null;
        });
    }

    setupLogPane() {
        const logPane = document.getElementById("logPane");
        logPane.addEventListener("click", (e) => {
            const simId = e.target.dataset.simId;
            if (simId) {
                const sim = this.simulations[simId];
                this.drawUI(sim.elements);
                document.getElementById("results").innerHTML = `
                    <strong>Simulation ${parseInt(simId) + 1} Details:</strong><br>
                    Login: ${sim.stats["Login"]}% | Search: ${sim.stats["Search"]}% | Help: ${sim.stats["Help"]}% | Exit: ${sim.stats["Exit"]}%<br>
                    Trials: ${sim.total}<br>
                    Success Rate (Login): ${sim.successRate}%
                `;
            }
        });
    }

    updateLogPane() {
        const logPane = document.getElementById("logPane");
        logPane.innerHTML = "<h3>Simulation Logs</h3>";
        this.simulations.forEach((sim, i) => {
            const logEntry = document.createElement("div");
            logEntry.className = "log-entry";
            logEntry.innerHTML = `<a href="#" data-sim-id="${i}">Simulation ${i + 1}: Success ${sim.successRate}% (${sim.total} trials)</a>`;
            logPane.appendChild(logEntry);
        });
    }

    async runTrial() {
        if (!this.running || this.logs.length >= this.trialCount) {
            this.running = false;
            const results = this.updateResults();
            this.simulations.push({
                elements: JSON.parse(JSON.stringify(this.config.elements)), // Deep copy
                stats: results.stats,
                successRate: results.successRate,
                total: results.total
            });
            this.updateLogPane();
            return;
        }

        const cursor = [
            Math.random() * this.config.gridSize[0],
            Math.random() * this.config.gridSize[1]
        ];
        const scores = this.calculateScores(cursor);
        const [chosen] = scores.reduce((max, curr) => curr[1] > max[1] ? curr : max);

        this.drawUI();
        await this.animateCursor(cursor, chosen.pos); // Animate cursor to target
        this.logs.push({ cursor, choice: chosen.name, scores: Object.fromEntries(scores.map(([e, s]) => [e.name, s])) });

        await new Promise(resolve => setTimeout(resolve, this.speed / 2)); // Pause after animation
        this.runTrial();
    }

    start(trials, speed) {
        this.trialCount = trials;
        this.speed = speed;
        this.logs = [];
        this.running = true;
        this.drawUI();
        this.runTrial();
    }

    reset() {
        this.running = false;
        this.logs = [];
        this.simulations = [];
        this.drawUI();
        this.updateResults();
        this.updateLogPane();
    }
}

// Initialize simulation
const config = new SimulationConfig();
const sim = new UISimulation(config);

// Event listeners for controls
document.getElementById("startBtn").addEventListener("click", () => {
    const trials = parseInt(document.getElementById("trialCount").value);
    const speed = parseInt(document.getElementById("speed").value);
    sim.start(trials, speed);
});

document.getElementById("resetBtn").addEventListener("click", () => {
    sim.reset();
});
