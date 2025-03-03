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
        this.canvas = document.getElementById("simulationCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.trialCount = 0;
        this.speed = 1000; // Default 1 second per trial
        this.running = false;
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

    drawUI() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const scaleX = this.canvas.width / this.config.gridSize[0];
        const scaleY = this.canvas.height / this.config.gridSize[1];

        for (const elem of this.config.elements) {
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

    drawCursor(cursor) {
        const scaleX = this.canvas.width / this.config.gridSize[0];
        const scaleY = this.canvas.height / this.config.gridSize[1];
        this.ctx.fillStyle = "blue";
        this.ctx.beginPath();
        this.ctx.arc(cursor[0] * scaleX, cursor[1] * scaleY, 5, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    updateResults() {
        const choices = this.logs.map(log => log.choice);
        const total = choices.length;
        const stats = {};
        for (const elem of this.config.elements) {
            stats[elem.name] = Math.round((choices.filter(c => c === elem.name).length / total) * 100) || 0;
        }
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = `
            <strong>Results:</strong><br>
            Login: ${stats["Login"]}% | Search: ${stats["Search"]}% | Help: ${stats["Help"]}% | Exit: ${stats["Exit"]}%<br>
            Trials completed: ${total}
        `;
    }

    async runTrial() {
        if (!this.running || this.logs.length >= this.trialCount) {
            this.running = false;
            return;
        }

        const cursor = [
            Math.random() * this.config.gridSize[0],
            Math.random() * this.config.gridSize[1]
        ];
        const scores = this.calculateScores(cursor);
        const [chosen, score] = scores.reduce((max, curr) => curr[1] > max[1] ? curr : max);

        this.drawUI();
        this.drawCursor(cursor);
        this.logs.push({ cursor, choice: chosen.name, scores: Object.fromEntries(scores.map(([e, s]) => [e.name, s])) });

        this.updateResults();
        await new Promise(resolve => setTimeout(resolve, this.speed));
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
        this.drawUI();
        this.updateResults();
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
