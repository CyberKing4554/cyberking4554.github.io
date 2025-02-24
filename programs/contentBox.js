let numberOfBoxes=0;
let content = {x:100,y:275};
let titleTextSize=30;

function drawContentBox(title,description,designColor,textColor,imageOfProgram, shadeColor, redirectLocation){
  numberOfBoxes ++;
  content.x = width/2;
  let newY = (content.y*numberOfBoxes);
  if(numberOfBoxes > 1){
    newY += (content.y/2)*(numberOfBoxes-1);
    }
  stroke(0);
  strokeWeight(2);
  fill(designColor);
  rectMode(CENTER);
  if((width-60)>imageOfProgram.width+30){
  rect(content.x,newY,width-60,350,20,20,20,20);
  imageMode(CENTER);
  image(imageOfProgram,width/2,(newY)-(65),imageOfProgram.width, 217);
  } else {
  rect(content.x,newY,width-60,350);
  imageMode(CENTER);
  image(imageOfProgram,width/2,(newY)-(65),width-60,217);
  }
  
  textAlign(CENTER);
  textSize(titleTextSize);
  fill(255);
  textFont(font2);
  if(textWidth(title) > width-78){
    titleTextSize --;
  }
  textSize(30);
  if(textWidth(title)< width-78){
    titleTextSize ++;
    if(titleTextSize>30){
      titleTextSize = 30;
    }
  }
  textSize(titleTextSize);
  text(title,width/2,newY+70,width-60);
  textFont(font1);
  textSize(16);
  fill(0);
  noStroke();
  text(description,width/2,newY+90,width-60);
  
  if (mouseIsPressed && mouseX > 30 && mouseX < width-30 && mouseY > newY-175 && mouseY < newY + 175){
    window.location.href = redirectLocation;
  }
  
}