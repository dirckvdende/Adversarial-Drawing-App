
export { clearCanvas, getImageData, undoStroke, clearUndoHistory };

const canvas = document.querySelector("#drawing-canvas");
const ctx = canvas.getContext("2d");
const brushWidth = 25;
const brushColor = "#fff";

let prevPos = null;
let isDrawing = false;
let undoHistory = [];

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
clearCanvas();
clearUndoHistory();

function clearCanvas() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function getImageData() {
    return canvas.toDataURL();
}

function undoStroke() {
    if (undoHistory.length <= 1)
        return;
    loadImageData(undoHistory[undoHistory.length - 1]);
    undoHistory.pop();
}

function clearUndoHistory() {
    undoHistory = [];
    pushUndoHistory();
}

function pushUndoHistory() {
    undoHistory.push(getImageData());
}

function loadImageData(imageData) {
    let image = new Image;
    image.onload = function() {
        ctx.drawImage(image, 0, 0);
    }
    image.src = imageData;
}

function drawDot(pos) {
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], brushWidth / 2, 0, 2 * Math.PI);
    ctx.fillStyle = brushColor;
    ctx.fill();
    prevPos = pos;
}

function drawLine(pos) {
    if (prevPos == null) {
        prevPos = pos;
        return;
    }
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;
    ctx.beginPath();
    ctx.moveTo(prevPos[0], prevPos[1]);
    ctx.lineTo(pos[0], pos[1])
    ctx.stroke();
    prevPos = pos;
}

function eventPos(e, isTouch) {
    if (isTouch) {
        let bcr = e.target.getBoundingClientRect();
        console.log(e);
        return [e.targetTouches[0].clientX - bcr.x, e.targetTouches[0].clientY -
        bcr.y];
    }
    return [e.offsetX, e.offsetY];
}

function startDrawing(e, isTouch) {
    isDrawing = true;
    pushUndoHistory();
    drawDot(eventPos(e, isTouch));
    e.preventDefault();
}
canvas.addEventListener("mousedown", (e) => startDrawing(e, false));
canvas.addEventListener("touchstart", (e) => startDrawing(e, true));
function mouseMove(e, isTouch) {
    if (isDrawing) {
        let pos = eventPos(e, isTouch);
        drawLine(pos);
        drawDot(pos);
        e.preventDefault();
    }
}
canvas.addEventListener("mousemove", (e) => mouseMove(e, false));
canvas.addEventListener("touchmove", (e) => mouseMove(e, true));
function endDrawing(e) {
    isDrawing = false;
    e.preventDefault();
}
canvas.addEventListener("mouseup", endDrawing);
canvas.addEventListener("mouseleave", endDrawing);
canvas.addEventListener("touchend", endDrawing);
canvas.addEventListener("touchcancel", endDrawing);