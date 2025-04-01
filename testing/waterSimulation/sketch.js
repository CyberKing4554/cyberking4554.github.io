let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;

let engine;
let world;
let particles = [];
let ground;
let mouseBarrier;  // Variable to hold the mouse boundary as a circle

// Control variables
let mode = 'filling';  // "filling" or "manual"
let inputField;
let submitButton;

// Droplet properties
const maxRetries = 10;  // Max attempts to find a valid spot for a droplet
let dropletsToAdd = 0;   // Number of droplets to spawn in manual mode
let currentDropletCount = 0; // Counter for droplets spawned manually

function setup() {
  createCanvas(600, 400);
  engine = Engine.create();
  world = engine.world;

  // Create the ground
  ground = Bodies.rectangle(width / 2, height - 10, width, 20, { isStatic: true });
  World.add(world, ground);

  // Create boundaries (walls)
  let leftWall = Bodies.rectangle(0, height / 2, 20, height, { isStatic: true });
  let rightWall = Bodies.rectangle(width, height / 2, 20, height, { isStatic: true });
  World.add(world, [leftWall, rightWall]);

  // Create a water "source" in the center
  let source = Bodies.rectangle(width / 2, 50, 100, 20, { isStatic: true });
  World.add(world, source);

  // Create an initial mouse barrier (invisible at first)
  let radius = 30; // Size of the barrier
  mouseBarrier = Bodies.circle(0, 0, radius, { isStatic: true }); // Initial position doesn't matter
  World.add(world, mouseBarrier);

  // Create a text input and submit button for manual mode
  inputField = createInput('');
  inputField.position(10, height + 10);
  inputField.size(50);

  submitButton = createButton('Submit');
  submitButton.position(inputField.x + inputField.width + 10, height + 10);
  submitButton.mousePressed(addManualDroplets);
  
  // Create a switch button for toggling between filling mode and manual mode
  let toggleButton = createButton('Toggle Mode');
  toggleButton.position(10, height + 40);
  toggleButton.mousePressed(toggleMode);
}

function draw() {
  background(0, 200, 255); // Light blue background to represent the sky

  Engine.update(engine);

  // Draw the ground
  fill(100, 200, 100);
  noStroke();
  rectMode(CENTER);
  rect(ground.position.x, ground.position.y, width, 20);

  // Move the mouse barrier to the mouse position
  Matter.Body.setPosition(mouseBarrier, { x: mouseX, y: mouseY });

  // Draw the visible mouse barrier (circle)
  fill(255, 0, 0, 150); // Red color with some transparency
  noStroke();
  ellipse(mouseX, mouseY, 60, 60); // Draw the mouse barrier as a circle

  // Depending on the mode, either add droplets continuously or manually
  if (mode === 'filling') {
    if (frameCount % 2 == 0) {
      addWaterDroplet();  // Make droplets fall from the center
    }
  }
  else if (mode === 'manual') {
    // Only add droplets when the user presses the submit button
    if (currentDropletCount < dropletsToAdd) {
      addWaterDroplet();  // Add droplets one by one
      currentDropletCount++;  // Increment the count
    }
  }

  // Update and display the water particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].show();
    if (particles[i].isOffScreen()) {
      particles.splice(i, 1);
    }
  }
}

// Function to create water droplets from the center
function addWaterDroplet() {
  let x, y, r;

  // Try to find a valid spot for the droplet
  let found = false;
  let attempts = 0;
  while (!found && attempts < maxRetries) {
    x = random(width / 2 - 50, width / 2 + 50); // Droplets fall from the source
    y = 50; // The water source height
    r = random(2, 5); // Smaller radius for droplets

    let valid = true;
    // Check if the new droplet intersects with existing droplets
    for (let i = 0; i < particles.length; i++) {
      let existingPos = particles[i].particle.position; // Matter.js body position
      let distBetween = dist(x, y, existingPos.x, existingPos.y); // Use p5.js dist function

      if (distBetween < r + particles[i].particle.circleRadius) {
        valid = false;
        break;
      }
    }

    if (valid) {
      found = true;  // Droplet can be placed here
    } else {
      attempts++;
    }
  }

  if (found) {
    let options = {
      restitution: 0.6, // Bounciness of the particles
      friction: 0.01, // Friction of the particles
      density: 0.1 // Light density to simulate water-like properties
    };

    let particle = Bodies.circle(x, y, r, options);
    World.add(world, particle);

    // Wrap the Matter.js body in a WaterDroplet class instance
    particles.push(new WaterDroplet(particle));
  }
}

// Function to add multiple droplets in manual mode based on user input
function addManualDroplets() {
  dropletsToAdd = int(inputField.value()); // Get the number from the input field
  currentDropletCount = 0; // Reset the droplet count
}

// Toggle between "filling" mode and "manual" mode
function toggleMode() {
  if (mode === 'filling') {
    mode = 'manual';
    inputField.show(); // Show the input field in manual mode
    submitButton.show(); // Show the submit button in manual mode
  } else {
    mode = 'filling';
    inputField.hide(); // Hide the input field in filling mode
    submitButton.hide(); // Hide the submit button in filling mode
  }
}

// p5.js rendering for water droplets
class WaterDroplet {
  constructor(particle) {
    this.particle = particle;
  }

  show() {
    fill(0, 0, 255, 150);
    noStroke();
    ellipse(this.particle.position.x, this.particle.position.y, this.particle.circleRadius * 2);
  }

  isOffScreen() {
    return this.particle.position.y > height;
  }
}
