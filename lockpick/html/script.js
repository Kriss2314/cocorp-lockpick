function openContainer() {
    $(".alllockpick").css("display", "block");
}

function closeContainer() {
    $(".alllockpick").css("display", "none");
}

$(document).ready(function () {

    let mazeCanvas = document.getElementById("mazeCanvas");
    let ctx = mazeCanvas.getContext("2d");
    let sprite;
    let finishSprite;
    let maze, draw, player;
    let cellSize;
    let difficulty = 10;
    let timeleft = 18;
    let downloadTimer;

    function rand(max) 
    {
        return Math.floor(Math.random() * max);
    }
    
    function shuffle(a) 
    {
        for (let i = a.length - 1; i > 0; i--) 
        {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    
    function changeBrightness(factor, sprite) 
    {
        let virtCanvas = document.createElement("canvas");
        virtCanvas.width = 500;
        virtCanvas.height = 500;
        let context = virtCanvas.getContext("2d");
        context.drawImage(sprite, 0, 0, 500, 500);
    
        let imgData = context.getImageData(0, 0, 500, 500);
    
        for (let i = 0; i < imgData.data.length; i += 4) 
        {
            imgData.data[i] = imgData.data[i] * factor;
            imgData.data[i + 1] = imgData.data[i + 1] * factor;
            imgData.data[i + 2] = imgData.data[i + 2] * factor;
        }
        context.putImageData(imgData, 0, 0);
    
        let spriteOutput = new Image();
        spriteOutput.src = virtCanvas.toDataURL();
        virtCanvas.remove();
        return spriteOutput;
    }
    
    function displayVictoryMess(moves) 
    {
        clearInterval(downloadTimer);
        closeContainer()
        //TUTAJ DODAJ CO MA BYĆ PO POPRAWNYM PRZEJŚCIU
        $.post('http://lockpick/wygrana', JSON.stringify({}));

    }
    
    
    function Maze(Width, Height) 
    {
        let mazeMap;
        let width = Width;
        let height = Height;
        let startCoord, endCoord;
        let dirs = ["n", "s", "e", "w"];
        let modDir = {
        n: {
          y: -1,
          x: 0,
          o: "s"
        },
        s: {
          y: 1,
          x: 0,
          o: "n"
        },
        e: {
          y: 0,
          x: 1,
          o: "w"
        },
        w: {
          y: 0,
          x: -1,
          o: "e"
        }
        };
    
        this.map = function() 
        {
            return mazeMap;
        };
        this.startCoord = function() 
        {
         return startCoord;
        };
        this.endCoord = function() 
        {
            return endCoord;
        };
    
        function genMap() 
        {
            mazeMap = new Array(height);
            for (y = 0; y < height; y++) 
            {
                mazeMap[y] = new Array(width);
                for (x = 0; x < width; ++x) 
                {
                    mazeMap[y][x] = {
                      n: false,
                      s: false,
                      e: false,
                      w: false,
                      visited: false,
                      priorPos: null
                    };
                }
            }
        }
    
        function defineMaze() 
        {
            let isComp = false;
            let move = false;
            let cellsVisited = 1;
            let numLoops = 0;
            let maxLoops = 0;
            let pos = {
              x: 0,
              y: 0
            };
            let numCells = width * height;
            while (!isComp) 
            {
                move = false;
                mazeMap[pos.x][pos.y].visited = true;
    
                if (numLoops >= maxLoops) 
                {
                    shuffle(dirs);
                    maxLoops = Math.round(rand(height / 8));
                    numLoops = 0;
                }
                numLoops++;
                for (index = 0; index < dirs.length; index++) 
                {
                    let direction = dirs[index];
                    let nx = pos.x + modDir[direction].x;
                    let ny = pos.y + modDir[direction].y;
    
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) 
                    {
                        //Check if the tile is already visited
                        if (!mazeMap[nx][ny].visited) 
                        {
                            //Carve through walls from this tile to next
                            mazeMap[pos.x][pos.y][direction] = true;
                            mazeMap[nx][ny][modDir[direction].o] = true;
    
                            //Set Currentcell as next cells Prior visited
                            mazeMap[nx][ny].priorPos = pos;
                            //Update Cell position to newly visited location
                            pos = {
                              x: nx,
                              y: ny
                            };
                            cellsVisited++;
                            //Recursively call this method on the next tile
                            move = true;
                            break;
                        }
                    }
                }
    
                if (!move) 
                {
                    //  If it failed to find a direction,
                    //  move the current position back to the prior cell and Recall the method.
                    pos = mazeMap[pos.x][pos.y].priorPos;
                }
                if (numCells == cellsVisited) 
                {
                    isComp = true;
                }
            }
        }
    
        function defineStartEnd() 
        {
            switch (rand(4)) 
            {
                case 0:
                    startCoord = {
                      x: 0,
                      y: 0
                    };
                    endCoord = {
                      x: height - 1,
                      y: width - 1
                    };
                break;
                case 1:
                    startCoord = {
                      x: 0,
                      y: width - 1
                    };
                    endCoord = {
                      x: height - 1,
                      y: 0
                    };
                break;
                case 2:
                    startCoord = {
                      x: height - 1,
                      y: 0
                    };
                    endCoord = {
                      x: 0,
                      y: width - 1
                    };
                break;
                case 3:
                    startCoord = {
                      x: height - 1,
                      y: width - 1
                    };
                    endCoord = {
                      x: 0,
                      y: 0
                    };
                break;
            }
      }
    
      genMap();
      defineStartEnd();
      defineMaze();
    }
    
    function DrawMaze(Maze, ctx, cellsize, endSprite = null) 
    {
      let map = Maze.map();
      let cellSize = cellsize;
      let drawEndMethod;
      ctx.lineWidth = cellSize / 40;
    
      this.redrawMaze = function(size) 
      {
          cellSize = size;
          ctx.lineWidth = cellSize / 50;
          drawMap();
          drawEndMethod();
      };
    
        function drawCell(xCord, yCord, cell) 
        {
            let x = xCord * cellSize;
            let y = yCord * cellSize;
    
            if (cell.n == false) 
            {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + cellSize, y);
                ctx.stroke();
            }
            if (cell.s === false) 
            {
                ctx.beginPath();
                ctx.moveTo(x, y + cellSize);
                ctx.lineTo(x + cellSize, y + cellSize);
                ctx.stroke();
            }
            if (cell.e === false) 
            {
                ctx.beginPath();
                ctx.moveTo(x + cellSize, y);
                ctx.lineTo(x + cellSize, y + cellSize);
                ctx.stroke();
            }
            if (cell.w === false) 
            {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + cellSize);
                ctx.stroke();
            }
        }
    
        function drawMap() 
        {
            for (x = 0; x < map.length; x++) 
            {
                for (y = 0; y < map[x].length; y++) 
                {
                    drawCell(x, y, map[x][y]);
                }
            }
        }
    
        function drawEndFlag() 
        {
            let coord = Maze.endCoord();
            let gridSize = 4;
            let fraction = cellSize / gridSize - 2;
            let colorSwap = true;
            for (let y = 0; y < gridSize; y++) 
            {
                if (gridSize % 2 == 0) 
                {
                    colorSwap = !colorSwap;
                }
                for (let x = 0; x < gridSize; x++) 
                {
                    ctx.beginPath();
                    ctx.rect(
                      coord.x * cellSize + x * fraction + 4.5,
                      coord.y * cellSize + y * fraction + 4.5,
                      fraction,
                      fraction
                    );
                    if (colorSwap) 
                    {
                        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                    } 
                    else 
                    {
                      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                    }
                    ctx.fill();
                    colorSwap = !colorSwap;
                }
            }
        }
    
        function drawEndSprite() 
        {
            let offsetLeft = cellSize / 50;
            let offsetRight = cellSize / 25;
            let coord = Maze.endCoord();
            ctx.drawImage(
                endSprite,
                2,
                2,
                endSprite.width,
                endSprite.height,
                coord.x * cellSize + offsetLeft,
                coord.y * cellSize + offsetLeft,
                cellSize - offsetRight,
                cellSize - offsetRight
            );
        }
    
        function clear() 
        {
            let canvasSize = cellSize * map.length;
            ctx.clearRect(0, 0, canvasSize, canvasSize);
        }
    
        if (endSprite != null) 
        {
            drawEndMethod = drawEndSprite;
        } 
        else 
        {
            drawEndMethod = drawEndFlag;
        }
        clear();
        drawMap();
        drawEndMethod();
    }
    
    function Player(maze, c, _cellsize, onComplete, sprite = null) 
    {
        let ctx = c.getContext("2d");
        let drawSprite;
        let moves = 0;
        drawSprite = drawSpriteCircle;
        if (sprite != null) 
        {
            drawSprite = drawSpriteImg;
        }
        let player = this;
        let map = maze.map();
        let cellCoords = {
            x: maze.startCoord().x,
            y: maze.startCoord().y
        };
        let cellSize = _cellsize;
        let halfCellSize = cellSize / 2;
    
        this.redrawPlayer = function(_cellsize) 
        {
            cellSize = _cellsize;
            drawSpriteImg(cellCoords);
        };
    
        function drawSpriteCircle(coord) 
        {
            ctx.beginPath();
            ctx.fillStyle = "yellow";
            ctx.arc(
              (coord.x + 1) * cellSize - halfCellSize,
              (coord.y + 1) * cellSize - halfCellSize,
              halfCellSize - 2,
              0,
              2 * Math.PI
            );
            ctx.fill();
            if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) 
            {
              onComplete(moves);
              player.unbindKeyDown();
            }
        }
    
        function drawSpriteImg(coord)
        {
            let offsetLeft = cellSize / 50;
            let offsetRight = cellSize / 25;
            ctx.drawImage(
              sprite,
              0,
              0,
              sprite.width,
              sprite.height,
              coord.x * cellSize + offsetLeft,
              coord.y * cellSize + offsetLeft,
              cellSize - offsetRight,
              cellSize - offsetRight
            );
            if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) 
            {
              onComplete(moves);
              player.unbindKeyDown();
            }
        }
    
        function removeSprite(coord) 
        {
            let offsetLeft = cellSize / 50;
            let offsetRight = cellSize / 25;
            ctx.clearRect(
              coord.x * cellSize + offsetLeft,
              coord.y * cellSize + offsetLeft,
              cellSize - offsetRight,
              cellSize - offsetRight
            );
        }
    
        function check(e) 
        {
            let cell = map[cellCoords.x][cellCoords.y];
            moves++;
            switch (e.keyCode) 
            {
                case 65:
                case 37: // west
                    if (cell.w == true) 
                    {
                        removeSprite(cellCoords);
                        cellCoords = {
                            x: cellCoords.x - 1,
                            y: cellCoords.y
                        };
                    drawSprite(cellCoords);
                    }
                break;
                
                case 87:
                case 38: // north
                    if (cell.n == true) 
                    {
                        removeSprite(cellCoords);
                        cellCoords = {
                            x: cellCoords.x,
                            y: cellCoords.y - 1
                        };
                        drawSprite(cellCoords);
                    }
                break;
                
                case 68:
                case 39: // east
                    if (cell.e == true) 
                    {
                        removeSprite(cellCoords);
                        cellCoords = {
                            x: cellCoords.x + 1,
                            y: cellCoords.y
                        };
                        drawSprite(cellCoords);
                    }
                break;
                
                case 83:
                case 40: // south
                    if (cell.s == true) 
                    {
                        removeSprite(cellCoords);
                        cellCoords = {
                            x: cellCoords.x,
                            y: cellCoords.y + 1
                        };
                        drawSprite(cellCoords);
                    }
                break;

                case 27: // esc
                    $.post('http://lockpick/przegrana', JSON.stringify({}));
                break;
            }
        }
    
        this.bindKeyDown = function() 
        {
            window.addEventListener("keydown", check, false);
    
            $("#view").swipe({
                swipe: function(
                    event,
                    direction,
                    distance,
                    duration,
                    fingerCount,
                    fingerData
                ) {
                    switch (direction) 
                    {
                        case "up":
                            check({
                                keyCode: 38
                            });
                        break;
                            
                        case "down":
                            check({
                                keyCode: 40
                            });
                        break;
                            
                        case "left":
                            check({
                                keyCode: 37
                            });
                        break;
                        case "right":
                            check({
                                keyCode: 39
                            });
                        break;
                        case "escape":
                            check({
                                keyCode: 27
                            });
                        break;
                    }
                },
                threshold: 0
            });
        };
    
        this.unbindKeyDown = function() 
        {
            window.removeEventListener("keydown", check, false);
            $("#view").swipe("destroy");
        };
    
        drawSprite(maze.startCoord());
        this.bindKeyDown();
    }

    window.onresize = function() 
    {
        let viewWidth = $("#view").width();
        let viewHeight = $("#view").height();
        if (viewHeight < viewWidth) 
        {
            ctx.canvas.width = viewHeight - viewHeight / 100;
            ctx.canvas.height = viewHeight - viewHeight / 100;
        } 
        else 
        {
            ctx.canvas.width = viewWidth - viewWidth / 100;
            ctx.canvas.height = viewWidth - viewWidth / 100;
        }
        cellSize = mazeCanvas.width / difficulty;
        if (player != null) 
        {
            draw.redrawMaze(cellSize);
            player.redrawPlayer(cellSize);
        }
    };

    let e = function() 
    {
        mazeCanvas = document.getElementById("mazeCanvas");
        ctx = mazeCanvas.getContext("2d");
        let viewWidth = $("#view").width();
        let viewHeight = $("#view").height();
        if (viewHeight < viewWidth) 
        {
            ctx.canvas.width = viewHeight - viewHeight / 100;
            ctx.canvas.height = viewHeight - viewHeight / 100;
        } 
        else 
        {
            ctx.canvas.width = viewWidth - viewWidth / 100;
            ctx.canvas.height = viewWidth - viewWidth / 100;
        }
    
        //Load and edit sprites
        let completeOne = false;
        let completeTwo = false;
        let isComplete = () => {
            if(completeOne === true && completeTwo === true)
            {
                setTimeout(function(){
                    makeMaze();
                    document.getElementById("timer").innerHTML = `Pozostało: 13`;
                }, 500);         
            }
        };
        sprite = new Image();
        sprite.src =
        "white.png" +
        "?" +
        new Date().getTime();
        sprite.setAttribute("crossOrigin", " ");
        sprite.onload = function() 
        {
            sprite = changeBrightness(1.2, sprite);
            completeOne = true;
            isComplete();
        };
    
        finishSprite = new Image();
        finishSprite.src = "green.png"+
        "?" +
        new Date().getTime();
        finishSprite.setAttribute("crossOrigin", " ");
        finishSprite.onload = function() 
        {
            finishSprite = changeBrightness(1.1, finishSprite);
            completeTwo = true;
            isComplete();
        };  
    };

    function makeMaze() 
    {
        if (player != undefined) 
        {
            player.unbindKeyDown();
            player = null;
        }
        let e = document.getElementById("diffSelect");
        cellSize = mazeCanvas.width / difficulty;
        maze = new Maze(difficulty, difficulty);
        draw = new DrawMaze(maze, ctx, cellSize, finishSprite);
        player = new Player(maze, mazeCanvas, cellSize, displayVictoryMess, sprite);
        if (document.getElementById("mazeContainer").style.opacity < "100") 
        {
            document.getElementById("mazeContainer").style.opacity = "100";
        }
    }
    
    function timer(){
        clearInterval(downloadTimer);
        downloadTimer = setInterval(function(){
            timeleft--;
            if(timeleft == 0){
                clearInterval(downloadTimer);
                $.post('http://lockpick/przegrana', JSON.stringify({}));
                document.getElementById("timer").innerHTML = ``;

            } else {
                document.getElementById("timer").innerHTML = `Pozostało: ${timeleft}`;
            }
        }, 1000);
    }


    window.addEventListener('message', function (event) {
        var item = event.data;
        if (item.odpal == true) {
            openContainer()
            e();
            timeleft = 18
            difficulty = 10
            timer();
        }
        if (item.odpal == false) {
            closeContainer()
            sprite = null;
            finishSprite = null;
            maze = null
            draw = null
            cellSize = null;
            difficulty = null;
            timeleft = 0
            ctx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height); //clear html5 canvas
        }
    })

})