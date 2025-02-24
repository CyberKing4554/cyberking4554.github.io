let font2;
let topBarX;
let turretSerialImg;
let dominoSerialImg;
let jumpixelImg;
let font1;

function setup(){
  createCanvas(windowWidth,1500);
  topBarX = width;
  topBarX -= 140;
  font2 = loadFont('assets/font2.ttf');
  turretSerialImg = loadImage('assets/Turret.jpg');
  dominoSerialImg = loadImage("assets/dom.jpg");
  jumpixelImg = loadImage('assets/jumpixel.png');
  font1 = loadFont('assets/font1.ttf');
}

function draw(){
  background(255);
  numberOfBoxes = 0;
  drawContentBox("Hackpack Turret Over Serial + Extensions","This program allows you to use a wireless serial communicator (such as a HC-05 or HC-06) to control your arduino nano. Along with adding compatablilty for certain arduino sensors.",220,0,turretSerialImg,80, 'https://google.com');
  drawContentBox("             Jumpixel v_1.0             ","A 2 player game created using Microsoft Makecode Arcade. (please note that you must host a multiplayer game to play).",220,0,jumpixelImg,80, 'https://arcade.makecode.com/S58103-16584-58261-03006');
  //dominoSerialImg.resize(325,172);
  //drawContentBox("Hackpack Domino Over Serial + Extensions","This program allows you to use a wireless serial communicator (such as a HC-05 or HC-06) to control your arduino nano.",220,0,dominoSerialImg,80, 'https://google.com');

  drawSelectionBar();
  
  
}


function windowResized(){
  resizeCanvas(windowWidth,1500);
  topBarX = width;
  topBarX -= 125;
}