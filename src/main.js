import $ from "jquery";
import Game from "../lib/Game.js";
// settings in-browser
const settings = {
    canvas : {
        height:null,
        width:null,
        id:"main-canvas"
    },
    grid:{
        width:10,
        height:18
    },
    constants:{
        delay:800
    },
    initGravity:6
};
// this is for the webpage the game goes in.
const windowConstants = {
    canvas : {
        widthRatio:0.65,
        heightRatio:0.95
    }
};
// create a new instance of the game with the settings and in-window settings, and then run it
function run(){
    // keep the width height ratio.
    // set the larger dimension based on the smaller dimension
    if(window.innerWidth < window.innerHeight){
        settings.canvas.width = window.innerWidth*windowConstants.canvas.widthRatio;
        settings.canvas.height = settings.canvas.width/windowConstants.canvas.heightRatio;
    } else{
        settings.canvas.height = window.innerHeight*windowConstants.canvas.heightRatio;
        settings.canvas.width = settings.canvas.height*windowConstants.canvas.widthRatio;
    }
    new Game(settings,(game)=>{game.run()});
}
// run on window load
$(document).ready(run);