class Utils{
    constructor(){}
    /**
     * For some reason, array.slice is messing up...
     */
    static copyMatrix(array){
        let n = [];
        for(let i=0;i<array.length;i++){
            n.push(array[i].slice());
        }
        return n;
    }
    static shapeToCoords(shape,xOffset,yOffset){
        let coords = [];
        let x;
        let y;
        for(let i=0;i<shape.length;i++){
            x = shape[i][0] + xOffset
            y = shape[i][0] + yOffset
            coords.push([x,y])
        }
        return coords;
    }
    static selectRandom(array){
        return array[Math.floor(Math.random()*array.length)];
    }
    static matrixToCoords(matrix){
        let coords = [];
        for(let x=0;x<matrix.length;x++){
            for(let y=0;y<matrix[x].length;y++){
                if(matrix[x][y]){
                    coords.push([x,y]);
                }
            }
        }
        return coords;
    }
}
module.exports = Utils;