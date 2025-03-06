let font2;
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
//readSerial();
//
function setup() {
  createCanvas(windowWidth, windowHeight);
  font2 = loadFont('/assets/font2.ttf');
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
}

function draw() {
  background(200);
  backButton.tick();  
  leftArrow.tick();
  upArrow.tick();
  rightArrow.tick();
  downArrow.tick();
  connectButton.tick();
  speed1.tick();
  speed2.tick();
  single.tick();
  all.tick();
  analizeStates();
  runSerial();
  
  
  
  if(backButton.buttonClicked()){
    window.location.href = 'https://cyberking4554.github.io/programs/';
    
  } else if (connectButton.buttonClicked()){
    connectToSerial();
  }
}

function windowResized(){
  resizeCanvas(windowWidth,windowHeight);
  leftArrow.y = height/2;
}

function analizeStates(){
  let a = false;
  let b = false;
  if(upArrow.buttonClicked()){
    toSend = 'u';
  } else if (downArrow.buttonClicked()){
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
}

async function connectToSerial(){
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600});
    connectButton.borderSettings(true,200,5,'green',false, 10);
    connectButton.textInit("Connected");
    connectButton.buttonWidth += 20;
  } catch (error){
    if(connectButton.borderColor == 'green'){
      connectButton.borderSettings(true,200,5,'red',false, 10);
    } else {
      connectButton.borderSettings(true,200,5,'green',false, 10);
    }
  }
}

async function runSerial(){
  if (typeof port !== 'undefined' || typeof port !== null){
    if (toSend != lastSend){
      lastSend = toSend;
      const writer = port.writable.getWriter();
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(toSend + ",");
      console.log(toSend+',');
      await writer.write(encodedData);
      connectButton.borderSettings(true,'yellow',5,'green',false, 10);
      writer.releaseLock();
    } else {
      connectButton.borderSettings(true,200,5,'green',false, 10);
    }
  }
  
}
