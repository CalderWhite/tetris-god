const $ = require("jquery");
import Utils from "./Utils.js"
import Piece from "./Piece.js";

class Game{
    constructor(settings,callback){
        this.init(settings,callback);
    }
    /**
     * Calls a bunch of setup functions for the game
     */
    init(settings,callback){
        // get the DOM canvas node
        this.canvas = document.getElementById(settings.canvas.id);
        // settings...
        this.constants=settings.constants;
        // init
        this.score = 0;
        this.gravity = settings.initGravity;
        // load pieces from json file in the cloud
        let game = this;
        this.constants.gridHeight = settings.grid.height;
        this.constants.gridWidth = settings.grid.width;
        // load pieces, and then do everything else in a callback jusssst in case there is a race condition
        this.loadPieces(() => {
            game.screenInit(settings);
            let grid = [];
            let line = [];
            for(let i=0;i<settings.grid.height;i++){
                line.push(null);
            }
            for(let i=0;i<settings.grid.width;i++){
                grid.push(line.slice());
            }
            game.setGrid(grid);
            callback(game);
        });
    }
    setGrid(matrix){
        this.grid = matrix;
    } 
    /**
     * Check if a piece can be rotated at its current position or note.
     */
    checkRotationCollision(piece){
        // theoreticallys rotate the piece, and add that to the original piece creating 1 new piece.
        let coords = piece.getCoords();
        let rotated = Utils.shapeToCoords(Utils.matrixToCoords(piece.states[(piece.state+1)%piece.states.length]),piece.pos.x,piece.pos.y);
        coords = coords.concat(rotated);
        let xValues = []
        let yValues = []
        for(let i=0;i<coords.length;i++){
            xValues.push(coords[i][0]);
            yValues.push(coords[i][1]);
        }
        
        // max and min values, creating a rectangle around the combined two pieces
        let lowestX = Math.min.apply(null,xValues);
        let highestX = Math.max.apply(null,xValues);
        let lowestY = Math.min.apply(null,yValues);
        let highestY = Math.max.apply(null,yValues);
        // avoid self collisions
        let tempGrid = Utils.copyMatrix(this.grid)

        for(let i=0;i<piece.shape.length;i++){
            let x = piece.shape[i][0] + piece.pos.x;
            let y = piece.shape[i][1] + piece.pos.y;
            if(x > -1 && y > -1){
                tempGrid[x][y] = null;
            }
        }
        if(
            lowestX < 0 ||
            highestX > this.constants.gridWidth - 1 ||
            lowestY < 0 ||
            highestY > this.constants.gridHeight - 1
        ){
            return true;
        }
        // check illegal positions
        for(let x=lowestX;x<highestX+1;x++){
            for(let y=lowestY;y<highestY+1;y++){
                if(
                    tempGrid[x][y] != null
                ){
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Game wrapper for rotating a piece
     */
    rotatePiece(piece){
        if(!this.checkRotationCollision(piece)){
            this.clearPieceFromGrid(piece);
            piece.rotate();
            this.writePieceToGrid(piece);
        } else{
            this.clearPieceFromGrid(piece);
            this.writePieceToGrid(piece);
        }
    }
    /**
     * Clear all lines (rows with a block in every column)
     */
    clearLines(){
        let lines = Array(this.grid[0].length);
        for(let i=0;i<lines.length;i++){
            lines[i] = true;
        }
        for(let x=0;x<this.grid.length;x++){
            for(let y=0;y<this.grid[x].length;y++){
                if(this.grid[x][y] == null){
                    lines[y] = false;
                }
            }
        }
        let empty = 0;
        for(let y=lines.length-1;y>0;y--){
            if(lines[y]){
                for(let x=0;x<this.grid.length;x++){
                    this.grid[x].splice(y,1);
                }
                empty++;
            }
        }
        for(let x=0;x<this.grid.length;x++){
            for(let i=0;i<empty;i++){
                this.grid[x].splice(0,0,null)
            }
        }
    }
    /**
     * Bind keys
     */
    keysInit(){
        let game = this
        document.onkeydown = (e) => { 
            e = e || window.event; 
            let charCode = e.charCode || e.keyCode
            switch (charCode) {
                case 87: // w (rotate piece)
                    game.rotatePiece(game.currentPiece);
                    break;
                case 38: // up arrow (rotate piece)
                    game.rotatePiece(game.currentPiece);
                    break;
                case 69: // e (stop)
                    game.stop();
                    break;
                case 65: // a (move piece left)
                    game.movePieceBy(game.currentPiece,-1,0)
                    break;
                case 37: // left arrow (move piece left)
                    game.movePieceBy(game.currentPiece,-1,0)
                    break;
                case 68: // d (move piece right)
                    game.movePieceBy(game.currentPiece,1,0)
                    break;
                case 39: // right arrow (move piece right)
                    game.movePieceBy(game.currentPiece,1,0)
                    break;
                case 83: // d (move piece down)
                    game.movePieceBy(game.currentPiece,0,1)
                case 40: // down arrow (move piece down)
                    game.movePieceBy(game.currentPiece,0,1)
                default:
                    break;
            }
        };
    }
    /**
     * Initialization functions relating to the <canvas>
     */
    screenInit(settings){
        // the actual thing we can blit to
        this.screen = this.canvas.getContext('2d');
        // clear it!
        this.clearScreen();
        this.constants.blockSize = Math.floor(settings.canvas.height/settings.grid.height);
        this.canvas.height = this.constants.blockSize*this.constants.gridHeight;
        this.canvas.width = this.constants.blockSize*this.constants.gridWidth;
    }
    /**
     * Gets the json file which contains piece data (colour, shape, etc.)
     */
    loadPieces(callback){
        let game = this;
        $.getJSON("data/pieces.json",(data) => {
            game.constants.pieces = data;
            callback();
        });
    }
    /**
     * Clear the canvas context
     */
    clearScreen(){
        this.screen.clearRect(0,0,this.canvas.width,this.canvas.height);
    }
    /**
     * Returns a piece object with a random type.
     */
    generateRandomPiece(){
        return new Piece(
            this,
            Utils.selectRandom(
                Object.keys(this.constants.pieces)
            )
        );
    }
    /**
     * Sets the current piece to a new piece
     */
    newPiece(){
        let p = this.generateRandomPiece();
        p.pos.y=-1;
        p.pos.x=Math.floor(this.constants.gridWidth/2)-Math.floor(p.grid.length/2);
        this.currentPiece=p;
    }
    /**
     * Sets the piece in the grid permanently.
     */
    writePieceToGrid(piece){
        for(let i=0;i<piece.shape.length;i++){
            let x = piece.shape[i][0] + piece.pos.x;
            let y = piece.shape[i][1] + piece.pos.y;
            if(x > -1 && y > -1){
                this.grid[x][y] = "rgb(" + piece.color.join(",") + ")";
            }
        }
    }
    /**
     * Erases piece from grid.
     */
    clearPieceFromGrid(piece){
        for(let i=0;i<piece.shape.length;i++){
            let x = piece.shape[i][0] + piece.pos.x;
            let y = piece.shape[i][1] + piece.pos.y;
            if(x > -1 && y > -1){
                this.grid[x][y] = null;
            }
        }
    }
    /**
     * Check any collisions on the bottom-sides of a piece
     */
    floorCheck(piece){
        // if the pieces are really large, this algorithm is better.
        // however, if the playing grid is huge, then a different algorithm is better
        // perhaps an algorithm that ignores the x,y pairs that are inside its own shape
        
        
        // avoid self collisions
        let tempGrid = this.grid.slice();
        for(let i=0;i<piece.shape.length;i++){
            let x = piece.shape[i][0] + piece.pos.x;
            let y = piece.shape[i][1] + piece.pos.y;
            if(x > -1 && y > -1){
                tempGrid[x][y] = null;
            }
        }
        // now check for collisions
        for(let i=0;i<piece.shape.length;i++){
            let x = piece.shape[i][0] + piece.pos.x;
            let y = piece.shape[i][1] + piece.pos.y;
            if(
                y >= this.constants.gridHeight-1
                || 
                tempGrid[x][y+1] != null
                ){
                return true;
            }
        }
        return false;
    }
    checkPieceCollision(piece,offsetX,offsetY){
        if(offsetX == undefined) offsetX=0;
        if(offsetY == undefined) offsetY=0;
        // avoid self collisions
        let tempGrid = this.grid.slice();
        for(let i=0;i<piece.shape.length;i++){
            let x = piece.shape[i][0] + piece.pos.x;
            let y = piece.shape[i][1] + piece.pos.y;
            if(x > -1 && y > -1){
                tempGrid[x][y] = null;
            }
        }
        // loop thru each and check the coords along with any given offset
        for(let i=0;i<piece.shape.length;i++){
            let x = piece.shape[i][0] + offsetX + piece.pos.x;
            let y = piece.shape[i][1] + offsetY + piece.pos.y;
            if(
                y > this.constants.gridHeight-1 ||
                x < 0 ||
                x > this.constants.gridWidth-1 || 
                tempGrid[x][y] != null
                ){
                return true;
            }
        }
        return false;
    }
    /**
     * Game method for moving a piece.
     */
    movePieceBy(piece,x,y){
            if(!this.checkPieceCollision(piece,x,y)){
                // erase the piece's old position on the grid
                this.clearPieceFromGrid(piece);
                // move the piece
                piece.moveBy(x,y);
                // write the new position to the grid
                this.writePieceToGrid(piece)
            } else{
                this.clearPieceFromGrid(piece);
                this.writePieceToGrid(piece);
            }
    }
    /**
     * Moves a piece down 1 space, and triggers reactions accordingly
     */
    progressPiece(piece){
        if(
            !this.floorCheck(piece)
            ){
                this.movePieceBy(piece,0,1)
        } else{
            this.count++;
            if(piece.pos.y < 1){
                this.writePieceToGrid(piece);
                this.stop();
            }
            this.writePieceToGrid(piece);
            // clear any lines as a result of this piece being places
            this.clearLines()
            this.newPiece();
        }
    }
    renderPiece(piece){
        this.screen.save();
        this.screen.fillStyle = "rgb(" + piece.color.join(",") + ")";
        // draw each individual block of the shape
        for(let i=0;i<piece.shape.length;i++){
            let x = piece.shape[i][0];
            let y = piece.shape[i][1];
            this.screen.fillRect(
                (piece.pos.x+x)*this.constants.blockSize,
                (piece.pos.y+y)*this.constants.blockSize,
                this.constants.blockSize,
                this.constants.blockSize
            );
        }
        this.screen.restore();
    }
    /**
     * Render the colors on the grid, ignoring undefiend and null.
     */
    renderGrid(){
        this.screen.save();
        for(let x=0;x<this.grid.length;x++){
            for(let y=0;y<this.grid[x].length;y++){
                let current = this.grid[x][y];
                if (current != null && current != undefined){
                    this.screen.fillStyle = current;
                    this.screen.fillRect(
                        x*this.constants.blockSize,
                        y*this.constants.blockSize,
                        this.constants.blockSize,
                        this.constants.blockSize
                    );
                }
            }
        }
        this.screen.restore();
    }
    renderAll(){
        //this.renderPiece(this.currentPiece);
        this.renderGrid();
    }
    /**
     * Prevent the next loop() from running.
     */
    stop(){
        this.stopCheck = true;
    }
    /**
     * Run the mainloop
     */
    run(){
        this.lastProgess = (new Date).getTime();
        this.keysInit();
        this.ln = 0;
        this.count = 0;
        this.stopCheck = false;
        this.newPiece();
        this.loop(this);
    }
    loop(game){
        // if it had been long enough, progress the current piece
        if((new Date).getTime() - game.lastProgess >= game.constants.delay*(1/game.gravity)){
            game.progressPiece(game.currentPiece);
            game.lastProgess=(new Date).getTime();
        }
        // blit at the end
        game.clearScreen();
        game.renderAll();
        // re run the mainloop
        if(!game.stopCheck){
            window.requestAnimationFrame(()=>{game.loop(game)});
        }
    }
}
module.exports = Game;