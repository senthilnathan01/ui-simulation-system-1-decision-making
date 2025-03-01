// lib/simulation.js
export class Simulation {
    constructor() {
      this.elements = [
        { name: "Login", prominence: 9, pos: [50, 50], color: "green", size: [15, 7] },
        { name: "Search", prominence: 7, pos: [50, 80], color: "yellow", size: [20, 7] },
        { name: "Help", prominence: 5, pos: [10, 80], color: "gray", size: [10, 10] },
        { name: "Exit", prominence: 3, pos: [90, 90], color: "red", size: [8, 8] },
      ];
      this.heuristicWeights = { salience: 0.5, proximity: 0.2, color: 0.3 };
      this.colorWeights = { green: 0.8, yellow: 0.4, gray: 0.3, red: 0.1 };
      this.logs = [];
    }
  
    run(trials = 100) {
      this.logs = [];
      for (let i = 0; i < trials; i++) {
        const cursor = [Math.random() * 100, Math.random() * 100];
        const scores = this.elements.map((elem) => ({
          ...elem,
          score: this._calculateScore(elem, cursor),
        }));
        const chosen = scores.reduce((a, b) => (a.score > b.score ? a : b));
        this.logs.push({ cursor, choice: chosen.name });
      }
    }
  
    _calculateScore(elem, cursor) {
      const dist = Math.hypot(elem.pos[0] - cursor[0], elem.pos[1] - cursor[1]);
      const proximityScore = 100 / (dist + 0.1);
      const colorScore = this.colorWeights[elem.color] || 0.5;
      const salienceScore = elem.prominence / 10;
      return (
        this.heuristicWeights.salience * salienceScore +
        this.heuristicWeights.proximity * proximityScore +
        this.heuristicWeights.color * colorScore
      );
    }
  
    getResults() {
      const choices = this.logs.map((log) => log.choice);
      return {
        login: (choices.filter((c) => c === "Login").length / choices.length) * 100,
        search: (choices.filter((c) => c === "Search").length / choices.length) * 100,
        help: (choices.filter((c) => c === "Help").length / choices.length) * 100,
        exit: (choices.filter((c) => c === "Exit").length / choices.length) * 100,
      };
    }
  }
