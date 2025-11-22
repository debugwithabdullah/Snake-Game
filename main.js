const canvas = document.querySelector(".game")
const ctx = canvas.getContext("2d")
let foodRoundness = 5

const debugArea = document.querySelector(".debugArea")
// Mobile View Responsiveness 
if (window.matchMedia("(max-width: 768px)").matches) {
    //mobile
    size = 300
    oneBlock = 10
    foodRoundness = 4
}
else {
    //dekstop
    size = 500
    oneBlock = 20
}


//Mobile Inputs
const leftUIbtn = document.getElementById("btnLeft")
const rightUIbtn = document.getElementById("btnRight")
const topUIbtn = document.getElementById("btnTop")
const downUIbtn = document.getElementById("btnDown")
// let size = 500
// let oneBlock = 20
canvas.width = size
canvas.height = size

//Game Variables
let gridWidth = size / oneBlock
const frameDelay = 80
let snakeDied = false
let capturedFood = false
let snakePos = [{ X: 100, Y: 100, dir: "0" }, { X: 0, Y: 0, dir: "0" }]
let score = 0

//EndScr 
const endScr = document.getElementById("endScr")
const endScoreText = document.getElementById("endScoreText")
const popSfx = document.getElementById("popSfx")
const overSfx = document.getElementById("overSfx")
const moveSfx = document.getElementById("moveSfx")
const restartBtn = document.getElementById("restart")
const highScoreText = document.getElementById("highScore")
endScr.style.display = "none"
const scoreText = document.getElementById("score")
const cb = document.getElementById("myCheck");
cb.checked = true
//for mobile view 
const deadTxt = document.getElementById("diedTxt")

let highScore = Number(localStorage.getItem("highScore")) ?? 0
highScoreText.textContent = highScore

function SetLocalScore() {

    if (score > highScore) {
        localStorage.setItem("highScore", JSON.stringify(score))
        highScoreText.textContent = score
    }

}


//Grid Pixels
let allBlocks = []

function renderGrid() {
    for (let j = 0; j < gridWidth * oneBlock; j += oneBlock) {
        for (let i = 0; i < gridWidth * oneBlock; i += oneBlock) {
            ctx.strokeStyle = "#6D6D6D"
            ctx.lineWidth = 0.4;
            ctx.strokeRect(i, j, oneBlock, oneBlock);
            allBlocks.push([i, j])
        }
    }
}
renderGrid()

function renderBg() {
    for (let j = 0; j < gridWidth * oneBlock; j += oneBlock) {
        for (let i = 0; i < gridWidth * oneBlock; i += oneBlock) {
            ctx.fillStyle = "#CDF399"
            ctx.fillRect(i, j, oneBlock, oneBlock);
        }
    }
}
renderGrid();

function renderSnake(array) {
    for (let i = 0; i < array.length; i++) {
        if (i ===
            0) { //head color
            ctx.fillStyle = "#79A1DE"
            ctx.fillRect(array[i].X, array[i].Y, oneBlock, oneBlock)
        } else {
            ctx.fillStyle = "#9fbdeaff"
            ctx.fillRect(array[i].X, array[i].Y, oneBlock, oneBlock)
        } // ctx.strokeStyle = "black" // ctx.strokeRect(array[i].X, array[i].Y, oneBlock, oneBlock);
    }
}

//listen for inputs and sets only head's direction according to input 
document.addEventListener('keydown', (e) => {
    if (e.key === "d" && snakePos[0].dir !== "l") {
        snakePos[0].dir = "r"

    }
    if (e.key === 'a' && snakePos[0].dir !== "r") {
        snakePos[0].dir = "l"

    }
    if (e.key === 'w' && snakePos[0].dir !== "d") {
        snakePos[0].dir = "u"

    }
    if (e.key === 's' && snakePos[0].dir !== "u") {
        snakePos[0].dir = "d"

    }
})

// ----------------------------------------------------------
//Mobile Input listen
leftUIbtn.addEventListener("click", () => {
    if (snakePos[0].dir !== "r") {
        snakePos[0].dir = "l"

        mobileRipple(leftUIbtn)
    }
})
rightUIbtn.addEventListener("click", () => {
    if (snakePos[0].dir !== "l") {
        snakePos[0].dir = "r"

        mobileRipple(rightUIbtn)

    }
})
topUIbtn.addEventListener("click", () => {
    if (snakePos[0].dir !== "d") {
        snakePos[0].dir = "u"

        mobileRipple(topUIbtn)

    }
})
downUIbtn.addEventListener("click", () => {
    if (snakePos[0].dir !== "u") {
        snakePos[0].dir = "d"

        mobileRipple(downUIbtn)

    }
})
// ----------------------------------------------------------

function update() {
    // Frames of game, first clears entire scr then renders grid then one by one sets pos of x and y from last unit to head 
    setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderBg()
        if (cb.checked) { } else {
            renderGrid()
        }
        if (!snakeDied) {
            for (let i = snakePos.length - 1; i > 0; i--) {
                snakePos[i].X = snakePos[i - 1].X;
                snakePos[i].Y = snakePos[i - 1].Y;
            }
            if (snakePos[0].dir === "d") snakePos[0].Y +=
                oneBlock;
            if (snakePos[0].dir === "u") snakePos[0].Y -=
                oneBlock;
            if (snakePos[0].dir === "l") snakePos[0].X -=
                oneBlock;
            if (snakePos[0].dir === "r") snakePos[0].X +=
                oneBlock;
            renderSnake(
                snakePos
            )
            ifCapturedFood()
            CheckDied()
            EndScreen()
            if (
                !capturedFood) {
                SpawnFood(randomValidBlock)
            } else {
                score++
                capturedFood = false
                randomValidBlock = randomValidArea()
                scoreText.textContent = score
                snakePos.push({
                    X: 0,
                    Y: 0,
                    dir: "0"
                })
                popSfx.play()
            }
        }
        if (snakeDied) {
            renderBg()
        }
        highlightWall()
    }, frameDelay)
}
update()
// needs an array of outer edge blocks of grid 
function OuterBlocksofGrid(gridWidth) {
    let OuterBlocks = []; // TOP WALL 
    for (let i = 0; i < gridWidth; i++) {
        OuterBlocks.push([i * oneBlock, 0]);
    } // RIGHT WALL
    for (let i = 0; i < gridWidth; i++) {
        OuterBlocks.push([(gridWidth - 1) * oneBlock, i * oneBlock]);
    } // BOTTOM WALL
    for (let i = 0; i < gridWidth; i++) {
        OuterBlocks.push([i * oneBlock, (gridWidth - 1) * oneBlock]);
    } // LEFT WALL
    for (let i = 0; i < gridWidth; i++) {
        OuterBlocks.push([0, i * oneBlock]);
    }
    return OuterBlocks;
}

function highlightWall() {
    let outerblocks = OuterBlocksofGrid(gridWidth)
    for (let i = 0; i < outerblocks.length; i++) {
        ctx.fillStyle = "#839B62"
        ctx.fillRect(outerblocks[i][0], outerblocks[i][1], oneBlock,
            oneBlock)
    }
}

function CheckDied() {
    let outerBlocks = OuterBlocksofGrid(gridWidth)
    for (let i = 0; i <
        outerBlocks.length; i++) {
        let x = outerBlocks[i][0]
        let y = outerBlocks[i][1]
        if (snakePos[0].X === x && snakePos[0].Y === y) {
            snakeDied = true
        }
    }
    for (let i = 2; i < snakePos.length; i++) {
        let x = snakePos[i].X
        let y = snakePos[i].Y
        if (snakePos[0].X === x && snakePos[0].Y === y) {
            snakeDied = true
        }
    }
}

function EndScreen() {
    if (snakeDied) {
        overSfx.play()
        endScoreText.textContent = score
        SetLocalScore()
        endScr.style.display = "flex"
        endScr.animate([{
            transform: "scale(1)"
        }, {
            transform: "scale(1.1)"
        }, {
            transform: "scale(1)"
        },], {
            duration: 450,
            easing: "ease"
        })
    }
}

restartBtn.addEventListener("click", () => {
    Restart()
})


let randomValidBlock = randomValidArea()

function randomValidArea() {
    let validArea = []
    let outerBlocks = OuterBlocksofGrid(gridWidth)
    for (let i = 0; i <
        allBlocks.length; i++) {
        let x = allBlocks[i][0];
        let y = allBlocks[i][1];
        let isOnSnake = false;
        let isOnOuterBlock =
            false; //snake segment 
        for (let j = 0; j < snakePos.length; j++) {
            if (snakePos[j].X === x && snakePos[j].Y === y) {
                isOnSnake = true;
                break; // stop checking more, we found a match 
            }
        }
        for (let k = 0; k < outerBlocks.length; k++) {
            if (outerBlocks[k][0] === x && outerBlocks[k][1] ===
                y) {
                isOnOuterBlock = true;
                break; // stop checking more, we found a match 
            }
        } // push to validArea 
        if (!isOnSnake && !isOnOuterBlock) {
            validArea.push([x, y]);
        }
    }
    let randomIndex = Math.floor(Math.random() * validArea.length)
    let randomBlock = validArea[randomIndex]
    return randomBlock
}

function SpawnFood(array) {
    ctx.fillStyle = "#E57373"
    roundRect(ctx, array[0], array[1], oneBlock, oneBlock, foodRoundness)
    ctx.fill() // ctx.fillRect(array[0], array[1], oneBlock, oneBlock) 
}

function ifCapturedFood() {
    let snakeX = snakePos[0].X
    let snakeY = snakePos[0].Y
    if (snakeX === randomValidBlock[0] && snakeY === randomValidBlock[
        1]) {
       
        capturedFood = true
    }
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius,
        y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function Restart() {
    snakePos = [{ X: 240, Y: 240, dir: "0" }, { X: 0, Y: 0, dir: "0" }]
    scoreText.textContent = 0
    score = 0
    snakeDied = false
    endScr.style.display = "none"
}


function mobileRipple(btn) {
    btn.addEventListener("touchstart", function (e) {
        const touch = e.touches[0];
        const rect = btn.getBoundingClientRect();

        // touch position inside button
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        // create ripple
        const ripple = document.createElement("span");
        ripple.classList.add("ripple");
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        btn.appendChild(ripple);

        // remove after animation
        setTimeout(() => {
            ripple.remove();
        }, 450);
    }, { passive: true });
}