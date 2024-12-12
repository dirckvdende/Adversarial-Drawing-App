
import { clearCanvas, getImageData, undoStroke, clearUndoHistory } from
"./drawing.js";
import { getProbability, loadModel } from "./classifier.js";
import "https://cdn.jsdelivr.net/npm/chart.js";

const promptWords = [
    "house", "ocean", "moon", "snowflake", "face", "bird", "wheel", "sun",
    "ant", "rain", "apple", "hat", "spider", "skull", "car", "feather", "fish",
    "bed", "sword", "eye", "book", "hand", "leaf", "star", "tree", "flower"
];
const promptSpan = document.getElementById("prompt-word");
const canvas = document.getElementById("drawing-canvas");
const undoThreshold = 0.001;

let prompt = null;
let scoreHistory = [];
let promptHistory = [];

await loadModel();
generatePrompt();

document.getElementById("undo-button").addEventListener("click", () => {
    undoStroke();
    getProbability(getImageData(), prompt).then((p) => scoreHistory.push(p));
});
document.getElementById("results-screen-button").addEventListener("click", () =>
{
    saveDrawing();
    document.getElementById("drawing-app").style.display = "none";
    document.getElementById("results-screen").style.display = "";
    generateResultsScreen();
});
document.getElementById("new-prompt-button").addEventListener("click", () => {
    saveDrawing();
    generatePrompt();
    clearCanvas();
    clearUndoHistory();
});
canvas.addEventListener("mouseup", processStrokeEnd);
canvas.addEventListener("mouseleave", processStrokeEnd);

function processStrokeEnd() {
    getProbability(getImageData(), prompt).then((p) => {
        if (p >= undoThreshold)
            undoStroke();
        else
            scoreHistory.push(p)
    });
}

function saveDrawing() {
    promptHistory.push({
        prompt: prompt,
        image: getImageData(),
        history: scoreHistory,
    });
    scoreHistory = [];
}

function generatePrompt() {
    prompt = promptWords[Math.floor(Math.random() * promptWords.length)];
    promptSpan.innerText = prompt.toUpperCase();
}

function generateResultsScreen() {
    const container = document.getElementById("results-card-container");
    promptHistory.forEach((item, index) => {
        if (index == 0)
            container.appendChild(document.createElement("hr"));
        let card = document.createElement("div");
        card.classList.add("results-card");
        let drawing = document.createElement("div");
        drawing.classList.add("results-drawing");
        let image = document.createElement("img");
        image.src = item.image;
        drawing.appendChild(image);
        card.appendChild(drawing);
        let prompt = document.createElement("div");
        prompt.classList.add("results-prompt");
        prompt.innerText = item.prompt.toUpperCase();
        card.appendChild(prompt);
        let graph = document.createElement("div");
        graph.classList.add("results-graph");
        let canvas = document.createElement("canvas");
        graph.appendChild(canvas);
        renderGraph(canvas, item.history);
        card.appendChild(graph);
        container.appendChild(card);
        container.appendChild(document.createElement("hr"));
    });
}

function renderGraph(elt, history) {
    console.log(history);
    let labels = [];
    for (let i = 0; i < history.length; i++)
        labels.push(i);
    let horLine = [];
    for (let i = 0; i < history.length; i++)
        horLine.push(undoThreshold);
    new Chart(elt, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Similarity",
                    data: history,
                    fill: "origin",
                    borderColor: "#4282eb",
                    backgroundColor: "#a2c4fa",
                    tension: 0.5,
                }, {
                    label: "Undo Threshold",
                    data: horLine,
                    fill: false,
                    borderColor: "#f5b60a",
                    backgroundColor: "#f5d98e",
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: false,
                },
                y: {
                    beginAtZero: true,
                    display: false,
                }
            },
            elements: {
                point: {
                    radius: 0
                }
            },
        }
    })
}