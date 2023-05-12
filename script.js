document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("tetrisCanvas");
    const context = canvas.getContext("2d");
    const scale = 30; // Adjust the scale value to change the size of the pieces
    canvas.width = 10 * scale; // Adjust the canvas width based on the scale
    canvas.height = 20 * scale; // Adjust the canvas height based on the scale

    const grid = createGrid(10, 20);
    let player = createPlayer();

    const colors = [
        null,
        "#ff0d72",
        "#0dc2ff",
        "#0dff72",
        "#f538ff",
        "#ff8e0d",
        "#ffe138",
        "#3877ff"
    ];

    function createGrid(width, height) {
        const rows = [];
        while (height--) {
            rows.push(new Array(width).fill(0));
        }
        return rows;
    }

    function createPlayer() {
        return {
            pos: { x: 0, y: 0 },
            matrix: createPiece(),
        };
    }

    function createPiece() {
        const pieces = [
            [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            [
                [2, 2],
                [2, 2],
            ],
            [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ],
            [
                [0, 4, 0],
                [0, 4, 0],
                [0, 4, 0],
                [0, 4, 0],
            ],
            [
                [0, 0, 0],
                [0, 5, 5],
                [5, 5, 0],
            ],
            [
                [0, 0, 0],
                [6, 6, 6],
                [0, 0, 6],
            ],
            [
                [7, 0, 0],
                [7, 7, 7],
                [0, 0, 0],
            ],
        ];

        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        return randomPiece;
    }

    function draw() {
        context.fillStyle = "#000";
        context.fillRect(0, 0, canvas.width, canvas.height);

        drawMatrix(grid, { x: 0, y: 0 });
        drawMatrix(player.matrix, player.pos);
    }

    function drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = colors[value];
                    context.fillRect(
                        x * scale + offset.x * scale,
                        y * scale + offset.y * scale,
                        scale,
                        scale
                    );
                }
            });
        });
    }

    function merge() {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    grid[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    function playerDrop() {
        player.pos.y++;
        if (collide()) {
          player.pos.y--;
          merge();
          sweep(); // Call sweep() function after merging the player's piece
          playerReset();
          updateScore();
        }
        dropCounter = 0;
      }

    function playerReset() {
        const pieces = [
            [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ],
            [
                [2, 2],
                [2, 2],
            ],
            [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3],
            ],
            [
                [0, 4, 0],
                [0, 4, 0],
                [0, 4, 0],
                [0, 4, 0],
            ],
            [
                [0, 0, 0],
                [0, 5, 5],
                [5, 5, 0],
            ],
            [
                [0, 0, 0],
                [6, 6, 6],
                [0, 0, 6],
            ],
            [
                [7, 0, 0],
                [7, 7, 7],
                [0, 0, 0],
            ],
        ];

        player.matrix = pieces[Math.floor(Math.random() * pieces.length)];
        player.pos.y = 0;
        player.pos.x = Math.floor((grid[0].length - player.matrix[0].length) / 2);

        if(collide()){
            gameover();
        }
    }

    function collide() {
        const m = player.matrix;
        const o = player.pos;
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (
                    m[y][x] !== 0 &&
                    (grid[y + o.y] && grid[y + o.y][x + o.x]) !== 0
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    function rotate(matrix, dir) {
        // Transpose the matrix
        for (let y = 0; y < matrix.length; ++y) {
          for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
          }
        }
      
        // Reverse each row of the matrix
        if (dir > 0) {
          matrix.forEach((row) => row.reverse());
        } else {
          matrix.reverse();
        }
      }
      

    let dropCounter = 0;
    let dropInterval = 10000; // Ajusta este valor para cambiar la velocidad con la que caen las piezas
    let lastTime = 0;

    function update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }

        draw();
        requestAnimationFrame(update);
    }

    document.addEventListener("keydown", function handleKeyPress(event) {
        console.log(event.key)
        if (event.key === "ArrowLeft") {
          playerMove(-1);
        } else if (event.key === "ArrowRight") {
          playerMove(1);
        } else if (event.key === "ArrowDown") {
          playerDrop();
        } else if (event.key === "ArrowUp") {
          playerRotate(1);
        }
      }      
    );

    function playerMove(dir) {
        player.pos.x += dir;
        if (collide()) {
            player.pos.x -= dir;
        }
    }

    function playerRotate(dir) {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.matrix, dir);
      
        while (collide()) {
          player.pos.x += offset;
          offset = -(offset + (offset > 0 ? 1 : -1));
          if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
          }
        }
      }
      

    function updateScore() {
        const scoreElement = document.getElementById("scoreValue");
        console.log(player.score)
        scoreElement.innerText = player.score;
    }

    function sweep() {
        outer: for (let y = grid.length - 1; y >= 0; --y) {
            for (let x = 0; x < grid[y].length; ++x) {
                if (grid[y][x] === 0) {
                    continue outer;
                }
            }
            const row = grid.splice(y, 1)[0].fill(0);
            grid.unshift(row);
            player.score += 10;
        }
    }

    function gameover() {
        alert(`Game Over! You Score Was: ${player.score}`);
        player.score = 0;
        grid.forEach((row) => row.fill(0));
        updateScore();
    }

    function update(time = 0) {
        const deltaTime = time - lastTime;
        lastTime = time;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }

        draw();
        updateScore();
        requestAnimationFrame(update);
    }

    update();
});

