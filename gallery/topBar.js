let styleColor =' #FF5722';
let barColor = 'rgb(59,161,196)';
let textColor = 0;
let barOpenAnimation = 'b';
let animaitonX;
let animationState = 1;
let middleLineTransparency = true;
let iconTopBarY = 10;
let iconBottomBarY =30;

function drawSelectionBar(){
  noStroke();
  rectMode(CORNER);
  fill(barColor);
  rect(0,0,width,50,0,0,20,20);
  textAlign(CENTER);
  
  if(width > 460){
  drawHacksButton();
  drawAboutMeButton();
  drawMyProgramsButton();
  drawDesignImagesButton();
  } else {
    drawIcon();
    animationTick();
  }
}

//-----------------------------Proper Screen Width--------------------------------//

function drawHacksButton(){
  if(mouseX > (topBarX/2)-50 && mouseX < (topBarX/2)+50 && mouseY >12 && mouseY < 37){
    fill(styleColor);
    rectMode(CENTER);
    rect(topBarX/2,25,100,35,5,5,5,5);
    if(mouseIsPressed){
      window.location.href = 'https://www.google.com';
    }
  }
  textAlign(CENTER);
  fill(textColor);
  textFont(font2);
  textSize(20);
  text("My Hacks",topBarX/2,30);
}

function drawAboutMeButton(){
    if(mouseX > (topBarX/2)-160 && mouseX < (topBarX/2)-60 && mouseY >12 && mouseY < 37){
    fill(styleColor);
    rectMode(CENTER);
    rect((topBarX/2)-110,25,100,35,5,5,5,5);
    if(mouseIsPressed){
      window.location.href = 'https://www.google.com';
    }
  }
  textAlign(CENTER);
  fill(textColor);
  textFont(font2);
  textSize(20);
  text("About Me",(topBarX/2)-110,30);
}

function drawMyProgramsButton(){
    if(mouseX > (topBarX/2)+60 && mouseX < (topBarX/2)+190 && mouseY >12 && mouseY < 37){
    fill(styleColor);
    rectMode(CENTER);
    rect((topBarX/2)+124,25,130,35,5,5,5,5);
    if(mouseIsPressed){
      window.location.href = 'https://www.google.com';
    }
  }
  textAlign(CENTER);
  fill(textColor);
  textFont(font2);
  textSize(20);
  text("My Programs",(topBarX/2)+125,30);
}

function drawDesignImagesButton(){
      if(mouseX > (topBarX/2)+205 && mouseX < (topBarX/2)+290 && mouseY >12 && mouseY < 37){
    fill(styleColor);
    rectMode(CENTER);
    rect((topBarX/2)+250,25,80,35,5,5,5,5);
    if(mouseIsPressed){
      window.location.href = 'https://www.google.com';
    }
  }
  textAlign(CENTER);
  fill(textColor);
  textFont(font2);
  textSize(20);
  text("Home",(topBarX/2)+250,30);
}

//------------------------------small screen width---------------------------------//
function drawIcon(){
  stroke(styleColor);
  strokeWeight(5);
  strokeCap(SQUARE);
  line(10,10,40,iconTopBarY);
  if (!middleLineTransparency) noStroke();
  line(10,20,40,20);
  stroke(styleColor);
  line(10,30,40,iconBottomBarY);
  iconTick();
}

function iconTick(){
  if(mouseIsPressed){
    if(mouseX>10 && mouseX<40 && mouseY>10 && mouseY<30){
      if(animationState < 1 || animationState > 49){
        if(barOpenAnimation == 'b') {barOpenAnimation = 'f';}
      
        else if(barOpenAnimation == 'f') {barOpenAnimation = 'b';}
        console.log(barOpenAnimation);
      }
    }
  }
}

function animationTick(){
  if(barOpenAnimation == 'f' && animationState < 50){
    animationState ++;
  } else if (barOpenAnimation == 'b' && animationState>0){
    animationState --;
  }
  if(animationState == 0){
    middleLineTransparency= true;
    iconTopBarY = 10;
    iconBottomBarY = 30;
  } else if(animationState < 20){
    iconTopBarY = 10+(animationState);
    middleLineTransparency = false;
    iconBottomBarY = 30-(animationState);
  }
  if (animationState <=50){
    rectMode(CORNER);
    noStroke();
    rect((animationState*4)-200,50,200,400,0,20,20,0);
    drawSidebarButtons();
  }
}

function drawSidebarButtons(){
  
    if(mouseX > 53 && mouseX < 145 && mouseY >90 && mouseY < 110){
    fill(styleColor);
    rectMode(CENTER);
    rect((animationState*4)-100,100,100,35,5,5,5,5);
    if(mouseIsPressed){
      window.location.href = 'https://www.google.com'; // PUT PAGE WEBSITE HERE!
    }
  }
  textAlign(CENTER);
  fill(textColor);
  textFont(font2);
  textSize(20);
  text("My Hacks",(animationState*4)-100,105);
  
      if(mouseX > 53 && mouseX < 148 && mouseY >141 && mouseY < 159){
    fill(styleColor);
    rectMode(CENTER);
    rect((animationState*4)-100,150,100,35,5,5,5,5);
    if(mouseIsPressed){
      window.location.href= 'https://www.google.com';
    }
  }
  textAlign(CENTER);
  fill(textColor);
  textFont(font2);
  textSize(20);
  text("About Me",(animationState*4)-100,155);
  
      if(mouseX > 36 && mouseX < 163 && mouseY >193 && mouseY < 208){
    fill(styleColor);
    rectMode(CENTER);
    rect((animationState*4)-100,200,130,35,5,5,5,5);
    if(mouseIsPressed){
      window.location.href= 'https://www.google.com';
    }
  }
  textAlign(CENTER);
  fill(textColor);
  textFont(font2);
  textSize(20);
  text("My Programs",(animationState*4)-100,205);
  
  if(mouseX > 64 && mouseX < 138 && mouseY >243 && mouseY < 258){
    fill(styleColor);
    rectMode(CENTER);
    rect((animationState*4)-100,250,80,35,5,5,5,5);
    if(mouseIsPressed){
      window.location.href= 'https://www.google.com'
    }
  }
  textAlign(CENTER);
  fill(textColor);
  textFont(font2);
  textSize(20);
  text("Home",(animationState*4)-100,255);
}
