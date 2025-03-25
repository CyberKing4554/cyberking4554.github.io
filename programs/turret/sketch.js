let font2;
let encodedData;
let font3;
let single;
let all;
let backButton;
let leftArrow;
let rightArrow;
let downArrow;
let upArrow;
let connectButton;
let toSend = 's';
let lastSend = 's';
let speed1;
let speed2;
let port;
let notConnected = true;
let additonSeclector;
let additionMode = 0;
let setAdditionMode = 0;
let currentAddition = 'No Addions';
let pollingRate = 0;
let previousPollRate = 100;
let pollingRateSelector;
let applyChangesButton;
let polingDelayTextY;
let recevedData;
let reader;
let awaitingNewData = 0;
//readSerial();
//

function preload(){
  font2 = loadFont('assets/font2.ttf');
  font3 = loadFont("assets/JetBrains.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  //Setup Back button
  backButton = new Button('textNoBorder',CENTER,40,20,80,40);
  backButton.textInit("Back");
  backButton.textSettings(false,'red',0,'rgb(0,0,0)',font2,30,28);
  backButton.borderSettings(false,'red',10,'green',false, 10);
  //Setup upArrow button.
  leftArrow = new Button('arrowWithBorder',CENTER,width-190,height/2,50,50);
  leftArrow.arrowSettings(-90,'standardWithoutBar','rgb(0,0,0)',false, 0,'blue',2);
  leftArrow.borderSettings(true,'rgb(87,87,87)',5,'rgb(175,175,175)', false, 10);
  
  upArrow = new Button('arrowWithBorder',CENTER,width-120,height/2-70,50,50);
  upArrow.arrowSettings(0,'standardWithoutBar','rgb(0,0,0)',false, 0,'blue',2);
  upArrow.borderSettings(true,'rgb(87,87,87)',5,'rgb(175,175,175)', false, 10);
  
  rightArrow = new Button('arrowWithBorder',CENTER,width-50,height/2,50,50);
  rightArrow.arrowSettings(90,'standardWithoutBar','rgb(0,0,0)',false, 0,'blue',2);
  rightArrow.borderSettings(true,'rgb(87,87,87)',5,'rgb(175,175,175)', false, 10);
  
  downArrow = new Button('arrowWithBorder',CENTER,width-120,height/2+70,50,50);
  downArrow.arrowSettings(180,'standardWithoutBar','rgb(0,0,0)',false, 0,'blue',2);
  downArrow.borderSettings(true,'rgb(87,87,87)',5,'rgb(175,175,175)', false, 10);
  
  connectButton = new Button('textWithBorder',CENTER,width-60,20,85,30);
  connectButton.textInit("Connect");
  connectButton.textSettings(false,'red',0,'rgb(0,0,0)',font2,20,22);
  connectButton.borderSettings(true,200,5,'red',false, 10);
  
  speed1 = new Button('textWithBorder',CENTER,width-190,height/2-70,40,40);
  speed1.textInit("1");
  speed1.textSettings(false,0,10,'black',font2,30,30);
  speed1.borderSettings(true,'rgb(87,87,87)',5,'rgb(175,175,175)', false, 10);
  
  speed2 = new Button('textWithBorder',CENTER,width-50,height/2-70,40,40);
  speed2.textInit("2");
  speed2.textSettings(false,0,10,'black',font2,30,30);
  speed2.borderSettings(true,'rgb(87,87,87)',5,'rgb(175,175,175)', false, 10);
  
  //------------------------------------------------------------
  single = new Button('imageWithBorder',CENTER, width-50, height/2+70,40,40);
  single.selectImage(loadImage('assets/single.png'));
  single.borderSettings(true,'rgb(87,87,87)',5,'rgb(175,175,175)', false, 10);
  
  all = new Button ('imageWithBorder', CENTER, width-190, height/2+70,40,40);
  all.selectImage(loadImage('assets/all.png'));
  all.borderSettings(true,'rgb(87,87,87)',5,'rgb(175,175,175)', false, 10);
//--------------------------------------------------------------//
  applyChangesButton = new Button('textWithBorder',CENTER, width-50, height/2+130,80,35);
  applyChangesButton.textInit("Apply");
  applyChangesButton.textSettings(false,0,5,'green',font2,25,26);
  applyChangesButton.borderSettings(true,'#575757',5,'#AFAFAF', false, 10);
  
//  additionSelector = createSelect();
//  additionSelector.position(width-325,height/2+100);
//  additionSelector.option("No Additions");
//  additionSelector.option("HC-SR04 Distance Display");
//  additionSelector.option("HC-SR04 Radar");
  pollingRateSelector = createSlider(0,200,0,25);
  pollingRateSelector.position(width-300,height/2+120);
  pollingRateSelector.size(125);
  pollingDelayTextY = 0;
  frameRate(30);
}

function draw() {
  //console.log(toSend);
  background(200);
  backButton.tick();  
  leftArrow.tick();
  upArrow.tick();
  rightArrow.tick();
  downArrow.tick();
  speed1.tick();
  speed2.tick();
  single.tick();
  all.tick();
  applyChangesButton.tick();
  connectButton.tick();
  analizeStates();
  handleExtenstionChange();
  runSerial();
  rectMode(CORNER);
  textAlign(RIGHT);
  textSize(15);
  fill(0);
  noStroke();
  textFont(font2);
  text("Polling Delay: "+pollingRateSelector.value(),width-170,height/2+150);
  
  
  if(backButton.buttonClicked()){
    window.location.href = 'https://cyberking4554.github.io/programs/';
    
  } else if (connectButton.buttonClicked()){
    connectToSerial();
  }
}

function windowResized(){
  resizeCanvas(windowWidth,windowHeight);
  leftArrow.x = width-190;
  leftArrow.y = height/2;
  upArrow.x = width-120;
  upArrow.y = height/2-70;
  rightArrow.x = width-50;
  rightArrow.y = height/2;
  downArrow.x = width-120;
  downArrow.y = height/2+70;
  speed1.x = width-190;
  speed1.y = height/2-70;
  speed2.x = width-50;
  speed2.y = height/2-70;
  single.x = width-50;
  single.y = height/2+70;
  all.x = width-190;
  all.y = height/2+70;
  connectButton.x = width-60;
  applyChangesButton.x = width-50;
  applyChangesButton.y = height/2+130;
 // additionSelector.position(width-325,height/2+100);
  pollingRateSelector.position(width-300,height/2+120);
}

function analizeStates(){
  let a = false;
  let b = false;
  if(downArrow.buttonClicked()){
    toSend = 'u';
  } else if (upArrow.buttonClicked()){
    toSend = 'd';
  } else if (leftArrow.buttonClicked()){
    toSend = 'l';
  } else if (rightArrow.buttonClicked()){
    toSend = 'i';
  }else if (speed1.buttonClicked()) {
    toSend = 'n';
  } else if (speed2.buttonClicked()) {
    toSend = 'm';
  } else if (single.buttonClicked()){
    toSend = 'f';
  } else if (all.buttonClicked()){
    toSend = 'a';
  }else {
    a = true;
  }
  
  if (keyIsPressed){
    if (key == 'w' || keyCode == 38){
      toSend = 'd';
    } else if (key == 's' || keyCode == 40){
      toSend = 'u';
    } else if (key == 'a' || keyCode == 37){
      toSend = 'l';
    } else if (key == 'd' || keyCode == 39){
      toSend = 'i';
    } else if (key == '1'){
      toSend = 'n';
    } else if (key == '2'){
      toSend = 'm';
    } else if (key == 'o' || key == 'z'){
      toSend = 'f';
    } else if (key == 'p' || key == 'x'){
      toSend = 'a';
    }
  } else {
    b= true;
  }
  if( a == true && b  == true){
    toSend = 's';
  }
  
  if (pollingRate != pollingRateSelector.value() || setAdditionMode != additionMode){
    applyChangesButton.textFillColor = 'red';
  } else {
    applyChangesButton.textFillColor = 'green';
  }

}

async function connectToSerial(){
  try {
    if (notConnected){
      notConnected = false;
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600});
      notConnected = false;
      connectButton.borderSettings(true,200,5,'green',false, 10);
      connectButton.textInit("Connected");
      connectButton.buttonWidth += 20;
      
    }
  } catch (error){
    connectButton.borderFillColor = 'red';
    connectButton.x = width/2;
    connectButton.y = height/2;
    connectButton.font = font3;
    connectButton.textInit(error + "\nPlease reload page and try again. \n\n If the error persists please create a repository issue on github at https://github.com/CyberKing4554/cyberking4554.github.io/issues\n or email to superspacer2020@gmail.com.");
    connectButton.buttonWidth = width;
    connectButton.buttonHeight = width/2;
  }
}

async function runSerial(){
  //debugger;
  if (notConnected == false){
    if (port){
      if (toSend != lastSend){
        console.log(toSend);
        lastSend = toSend;
        const writer = port.writable.getWriter();
        const encoder = new TextEncoder();
      
        if(toSend != 'p'){
          encodedData = encoder.encode(toSend);
          //console.log(toSend);
        } else {
          encodedData = encoder.encode(toSend + pollingRate+";"+"0"+"\n");
          console.log(toSend + pollingRate+";"+setAdditionMode+"\n");
        }
        await writer.write(encodedData);
        connectButton.borderSettings(true,'yellow',5,'green',false, 10);
        writer.releaseLock();
      } else {
        connectButton.borderSettings(true,200,5,'green',false, 10);
      }
    }
  }
}
function handleExtenstionChange(){
  additionMode = 0;
  if(applyChangesButton.buttonClicked() && applyChangesButton.textFillColor != 'green'){
    pollingRate = pollingRateSelector.value();
    setAdditionMode = additionMode;
    toSend = 'p';
  }
}