// Declare Matter.js variables
let updateDelay;
let previousSecond;
let frames;
let framesToDisplay;
let threshold = 10;
let updateDelay2 = 0;
let timeTillFPSUpdate = 3;
let amountToIncrease = 300;
let average = [];
let engine, world;
let circles = [];
let box;
let numCircles = 1000;
let leftWall;
let rightWall;
let upper;
let circleRadius = 8;
let restitution = 0; // Bounciness of the circles

function setup() {
  createCanvas(800, 600);
  // Create Matter.js engine and world
  engine = Matter.Engine.create();
  world = engine.world;

  // Create a simple box boundary to contain the circles
  box = Matter.Bodies.rectangle(width / 2, height - 50, width, 100, { isStatic: true });
  leftWall = Matter.Bodies.rectangle(0,0,80,height+500, {
    isStatic: true
  });
  rightWall = Matter.Bodies.rectangle(width-20,0, 80, height+500, {
    isStatic: true
  });
  // Add box to the world
  Matter.World.add(world, box);
  Matter.World.add(world ,leftWall);
  Matter.World.add(world, rightWall);
  // Create initial circles
  for (let i = 0; i < numCircles; i++) {
    createCircle();
  }
  
  // Set up input fields to control the properties
 // createInputControls();
}

function draw() {
  restitution = (frameCount/100000)*64;
  background(200);
    frames ++;
  if(second() != previousSecond){
    previousSecond = second();
    
    framesToDisplay = frames;
    frames = 0;
    if (!isNaN(framesToDisplay)){
    average[updateDelay2] = framesToDisplay;
      
    }
    console.log(framesToDisplay);
    updateDelay2 ++;
    if(updateDelay2 == timeTillFPSUpdate){
     
      framesToDisplay = 0;
      let i =0;
      while (i< timeTillFPSUpdate){
        framesToDisplay += average[i];
        console.log("d "+ average[i]);
        i ++;
      }
      console.log(framesToDisplay);

      framesToDisplay = framesToDisplay/timeTillFPSUpdate;
      console.log("calculated average: "+framesToDisplay);
      if (threshold < framesToDisplay){
        updateDelay2 = 0;
        if (framesToDisplay < threshold+10){
          numCircles += amountToIncrease/10;
        }else{
        numCircles += amountToIncrease;
        }
        updateProperties();
        //console.log("updated");
      } else {
        updateDelay2 = 0;
        if (framesToDisplay > threshold-10){
          numCircles -= amountToIncrease/10;
        }else{
        numCircles -= amountToIncrease;
        }
        updateProperties();
      }
      console.log(numCircles);
    }
     //timeTillFPSUpdate = round((numCircles/100)+restitution)/2;
  }
  // Update the Matter.js engine
  Matter.Engine.update(engine);

  // Draw box
  fill(150);
  rectMode(CENTER);
  rect(box.position.x, box.position.y, width, 100);
    rect(leftWall.position.x,leftWall.position.y, 80, height +500);
  rect(rightWall.position.x,rightWall.position.y, 80, height +500);
  // Draw the circles
  for (let circle of circles) {
    
    ellipse(circle.position.x, circle.position.y, circle.circleRadius * 2);
  }
  
    fill(0);
    textSize(30);
    text("FPS: " + framesToDisplay + "    Entity Count: "+ numCircles+" \nRestitution: "+ restitution + "\n", 90, height-55);
  
}

// Function to create a circle with random x position
function createCircle() {
  let circle = Matter.Bodies.circle(random(50, width - 50), random(50, 300), circleRadius, {
    restitution: restitution
  });
  Matter.World.add(world, circle);
  circles.push(circle);
  
}

// Function to update properties based on input values
function updateProperties() {
  // Remove all circles from the world
  for (let circle of circles) {
    Matter.World.remove(world, circle);
  }
  circles = [];
  
  // Get user inputs for number, size, and restitution
  //numCircles = int(select('#numCircles').value());
 // circleRadius = int(select('#circleRadius').value());
 // restitution = float(select('#restitution').value());
  
  // Create new circles based on new properties
  for (let i = 0; i < numCircles; i++) {
    createCircle();
  }

}

// Set up input fields and a button to update properties
function createInputControls() {
  // Number of circles input
  createDiv('Number of Circles').position(20, height + 10);
  createInput('5').id('numCircles').position(20, height + 30);
  
  // Circle size input
  createDiv('Circle Radius').position(160, height + 10);
  createInput('30').id('circleRadius').position(160, height + 30);
  
  // Restitution input
  createDiv('Restitution').position(300, height + 10);
  createInput('0.8').id('restitution').position(300, height + 30);
  
  // Button to apply changes
  let button = createButton('Update');
  button.position(450, height + 30);
  button.mousePressed(updateProperties);
}
