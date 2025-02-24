let font1;
let font2;
let topBarX;
let crane;
let construciton;

function setup(){
  createCanvas(windowWidth,1500);
  font1 = loadFont('assets/font1.ttf');
  font2 = loadFont('assets/font2.ttf');
  topBarX = width;
  topBarX -= 140;
  crane = loadImage('assets/crane.png');
  construction = loadImage('assets/construction.png');
}
function draw(){
  background(255);

  underConstructionSign();
  drawSelectionBar();
}
function mousePressed(){

}

function windowResized(){
  resizeCanvas(windowWidth,1500);
  topBarX = width;
  topBarX -= 125;
}