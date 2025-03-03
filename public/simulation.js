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
        this.speed = 1000;
        this.running = false;
        this.prevCursor = null; // Store previous cursor position for motion direction
        this.setupElementControls();
        this.setupDragging();
        this.drawUI();
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
        const x = cursor[0] * scaleX;
        const y = cursor[1] * scale
