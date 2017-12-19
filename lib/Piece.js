import Utils from "./Utils.js"

class Piece{
    constructor(game,type){
        // convert the grid from the hard data to a list of coordinates the rendering method will use
        this.states = game.constants.pieces[type].states;
        this.state = 0;
        this.update();
        this.color = game.constants.pieces[type].color;
        this.type = type;
        this.pos = {x:0,y:0};
    }
    setPos(x,y){
        this.pos.x=x;
        this.pos.y=y;
    }
    getCoords(){
        return Utils.shapeToCoords(this.shape,this.pos.x,this.pos.y);
    }
    /**
     * rotate the piece's grid by 90 degrees.
     */
    rotate(){
        this.state++;
        this.state%=this.states.length;
        this.update();
    }
    update(){
        this.grid = this.states[this.state];
        this.shape = Utils.matrixToCoords(this.grid);
    }
    moveBy(x,y){
        this.pos.x+=x;
        this.pos.y+=y;
    }
}
module.exports = Piece;