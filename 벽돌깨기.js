const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

let ballRadius = 10;
let balls = [{ x: getRandomInt(ballRadius, canvas.width - ballRadius), y: getRandomInt(canvas.height / 2, canvas.height - ballRadius), dx: 2, dy: -2 }];
let paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;
let brickRowCount = 3;
let brickColumnCount = 5;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;
let score = 0;
let level = 1;
let gameOver = false;
let nextLevel = false;
let colors = ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8B00FF"];
let currentColorIndex = 0;
let particles = []; // 파티클 배열

const bricks = [];
function initBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}
initBricks();

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status == 1) {
                for (let ball of balls) {
                    if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                        ball.dy = -ball.dy;
                        b.status = 0;
                        score++;
                        createParticles(b.x, b.y, colors[currentColorIndex]); // 파티클 생성
                        if (Math.random() < 0.05) {
                            balls.push({
                                x: getRandomInt(ballRadius, canvas.width - ballRadius),
                                y: getRandomInt(canvas.height / 2, canvas.height - ballRadius),
                                dx: 2 * (Math.random() < 0.5 ? 1 : -1),
                                dy: -2
                            });
                        }
                        if (score % 15 === 0 && score != 0) { // 15의 배수일 때
                            nextLevel = true;
                        }
                    }
                }
            }
        }
    }
}

function drawParticles() {
    for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.closePath();

        p.x += p.dx;
        p.y += p.dy;
        p.life -= 1;

        if (p.life <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
}

function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x + brickWidth / 2,
            y: y + brickHeight / 2,
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
            radius: 3,
            color: color,
            life: 50
        });
    }
}

function drawBall() {
    for (let ball of balls) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();
    }
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status == 1) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = colors[currentColorIndex];
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: " + score, 8, 20);
}

function drawLevel() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Level: " + level, canvas.width - 65, 20);
}

function drawMessage(message) {
    ctx.font = "24px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(message, canvas.width / 2 - 60, canvas.height / 2);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawParticles(); // 파티클 그리기
    drawBall();
    drawPaddle();
    drawScore();
    drawLevel();

    if (nextLevel) {
        drawMessage("NEXT LEVEL");
        setTimeout(nextLevelFunction, 1000); // 1초 후에 다음 레벨로 이동
        nextLevel = false; // 추가: 메시지 표시 후 다음 레벨로 이동 준비
    } else if (gameOver) {
        drawMessage("GAME OVER");
    } else {
        collisionDetection();

        for (let ball of balls) {
            if (ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) {
                ball.dx = -ball.dx;
            }
            if (ball.y + ball.dy < ballRadius) {
                ball.dy = -ball.dy;
            } else if (ball.y + ball.dy > canvas.height - ballRadius) {
                if (ball.x > paddleX && ball.x < paddleX + paddleWidth) {
                    ball.dy = -ball.dy;
                } else if (ball.y - ballRadius > canvas.height) {
                    balls = balls.filter(b => b !== ball); // Remove ball if it falls below the paddle
                }
            }
            ball.x += ball.dx;
            ball.y += ball.dy;
        }

        if (balls.length === 0) {
            gameOver = true;
            setTimeout(() => document.location.reload(), 2000);
        }

        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }

        requestAnimationFrame(draw);
    }
}

function nextLevelFunction() {
    let speedMultiplier = 1.1;

    // 기존의 모든 공의 속도를 증가시키고, 랜덤 위치로 재배치합니다.
    balls = balls.map(ball => {
        let newDx = ball.dx * speedMultiplier;
        let newDy = ball.dy * speedMultiplier;
        return {
            x: getRandomInt(ballRadius, canvas.width - ballRadius),
            y: getRandomInt(canvas.height / 2, canvas.height - ballRadius), // 화면의 중간 아래에서 스폰
            dx: newDx,
            dy: -Math.abs(newDy) // 항상 위로 올라가도록 설정
        };
    });

    paddleX = (canvas.width - paddleWidth) / 2;
    level++;
    if (level % 5 === 0) {
        currentColorIndex = (currentColorIndex + 1) % colors.length;
    }
    initBricks();
    draw();
}

// Helper function to get a random integer between min and max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

draw();
