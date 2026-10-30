
/*
  Q-LEARNING TARGET CHASER
  p5.js 2.3.4

  Controls:
  SPACE = Pause / resume
  V     = Toggle vision rays
  R     = Reset all training

  The agent only receives information from its seven
  vision rays. It does not receive the target's coordinates.
*/

// --------------------------------------------------
// SETTINGS
// --------------------------------------------------

const CANVAS_SIZE = 400;
const BALL_RADIUS = 10;
const TARGET_RADIUS = 10;

const MAX_SPEED = 2.8;
const THRUST = 0.16;
const FRICTION = 0.985;
const BRAKE_FRICTION = 0.88;

const TURN_ACCELERATION = 0.005;
const MAX_TURN_SPEED = 0.045;
const TURN_FRICTION = 0.90;

const VISION_ANGLES = [
  -Math.PI / 2,
  -Math.PI / 3,
  -Math.PI / 6,
  0,
  Math.PI / 6,
  Math.PI / 3,
  Math.PI / 2
];

const VISION_CONE_ANGLE = Math.PI / 15;

// --------------------------------------------------
// REWARD SETTINGS
// --------------------------------------------------

const STEP_PENALTY = -0.02;
const DISCOVERY_REWARD = 1;
const ALIGNMENT_REWARD = 2.0;
const DISTANCE_REWARD = 0.08;
const WALL_PENALTY = 2;
const CATCH_REWARD = 200;

// --------------------------------------------------
// Q-LEARNING SETTINGS
// --------------------------------------------------

const LEARNING_RATE = 0.12;
const DISCOUNT_FACTOR = 0.97;

const STARTING_EPSILON = 0.35;
const MIN_EPSILON = 0.03;
const EPSILON_DECAY = 0.99998;

const REWARD_HISTORY_LENGTH = 1000;
const SAVE_INTERVAL = 250;

const STORAGE_KEY = "targetChaserQLearning_v2";

// --------------------------------------------------
// ACTIONS
// --------------------------------------------------

const ACTIONS = [
  "coast",
  "turnLeft",
  "turnRight",
  "forward",
  "forwardLeft",
  "forwardRight",
  "brake"
];

// --------------------------------------------------
// GLOBAL VARIABLES
// --------------------------------------------------

var ai = null;
var target = null;

var qTable = new Map();

var paused = false;
var showVision = true;

var epsilon = STARTING_EPSILON;

var totalReward = 0;
var stepCount = 0;
var catchCount = 0;

var episodeSteps = 0;
var totalMovesToCatch = 0;

var rewardHistory = [];

var previousVision = null;
var previousAlignment = 0;
var previousDistance = null;
var previousVisible = false;

var lastReward = 0;

// --------------------------------------------------
// SETUP
// --------------------------------------------------

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);

  textFont("Arial");

  ai = {
    x: width / 2,
    y: height / 2,
    vx: 0,
    vy: 0,
    heading: 0,
    turnSpeed: 0
  };

  target = createTarget();

  loadTraining();

  previousVision = readVision();
}

// --------------------------------------------------
// TARGET
// --------------------------------------------------

function createTarget() {
  return {
    x: random(30, width - 30),
    y: random(30, height - 30)
  };
}

function respawnTarget() {
  target = createTarget();
}

// --------------------------------------------------
// MAIN DRAW LOOP
// --------------------------------------------------

function draw() {
  background(245);

  if (!paused) {
    updateAI();
  }

  drawTarget();
  drawAI();

  if (showVision) {
    drawVision();
  }

  drawHUD();

  // Save training periodically.
  if (!paused && stepCount > 0 &&
      stepCount % SAVE_INTERVAL === 0) {
    saveTraining();
  }
}

// --------------------------------------------------
// AI UPDATE
// --------------------------------------------------

function updateAI() {
  let vision = readVision();

  let state = getState(vision);

  let action = chooseAction(state);

  applyAction(action);

  updatePhysics();

  // Read vision again after movement.
  let newVision = readVision();

  let newState = getState(newVision);

  let reward = calculateReward(
    vision,
    newVision
  );

  let oldQ = getQValue(state, action);

  let bestNextQ = getBestQValue(newState);

  let updatedQ =
    oldQ +
    LEARNING_RATE *
    (
      reward +
      DISCOUNT_FACTOR * bestNextQ -
      oldQ
    );

  setQValue(state, action, updatedQ);

  totalReward += reward;
  lastReward = reward;

  rewardHistory.push(reward);

  if (rewardHistory.length > REWARD_HISTORY_LENGTH) {
    rewardHistory.shift();
  }

  stepCount++;
  episodeSteps++;

  epsilon = Math.max(
    MIN_EPSILON,
    epsilon * EPSILON_DECAY
  );

  previousVision = newVision;

  // Save the current alignment and distance.
  previousAlignment = getAlignmentScore(newVision);
  previousDistance = getBestTargetDistance(newVision);
  previousVisible = newVision.targetVisible;

  checkCatch();
}

// --------------------------------------------------
// VISION SYSTEM
// --------------------------------------------------

function readVision() {
  let rays = [];

  let targetVisible = false;
  let bestRay = -1;
  let bestDistance = Infinity;
  let bestAlignment = 0;

  let closestWall = Infinity;

  for (let i = 0; i < VISION_ANGLES.length; i++) {
    let angle = ai.heading + VISION_ANGLES[i];

    let dx = Math.cos(angle);
    let dy = Math.sin(angle);

    let wallDistance = getWallDistance(dx, dy);

    let targetDistance = getTargetDistance(
      dx,
      dy,
      wallDistance
    );

    let seesTarget = targetDistance !== null;

    if (seesTarget) {
      targetVisible = true;

      if (targetDistance < bestDistance) {
        bestDistance = targetDistance;
        bestRay = i;

        bestAlignment =
          1 - Math.abs(VISION_ANGLES[i]) /
          (Math.PI / 2);
      }
    }

    closestWall = Math.min(
      closestWall,
      wallDistance
    );

    rays.push({
      dx: dx,
      dy: dy,
      wallDistance: wallDistance,
      targetDistance: targetDistance,
      seesTarget: seesTarget
    });
  }

  return {
    rays: rays,
    targetVisible: targetVisible,
    bestRay: bestRay,
    bestDistance: bestDistance,
    bestAlignment: bestAlignment,
    closestWall: closestWall
  };
}

// Distance from the ball to the nearest wall
// along a ray.
function getWallDistance(dx, dy) {
  let distances = [];

  if (dx > 0) {
    distances.push(
      (width - BALL_RADIUS - ai.x) / dx
    );
  } else if (dx < 0) {
    distances.push(
      (BALL_RADIUS - ai.x) / dx
    );
  }

  if (dy > 0) {
    distances.push(
      (height - BALL_RADIUS - ai.y) / dy
    );
  } else if (dy < 0) {
    distances.push(
      (BALL_RADIUS - ai.y) / dy
    );
  }

  let positiveDistances = distances.filter(
    d => d >= 0
  );

  return Math.min(...positiveDistances);
}

// Check whether a ray intersects the target.
function getTargetDistance(dx, dy, wallDistance) {
  let tx = target.x - ai.x;
  let ty = target.y - ai.y;

  let projection = tx * dx + ty * dy;

  if (projection <= 0) {
    return null;
  }

  let perpendicularSquared =
    tx * tx + ty * ty -
    projection * projection;

  let radiusSquared =
    (TARGET_RADIUS + 2) *
    (TARGET_RADIUS + 2);

  if (perpendicularSquared > radiusSquared) {
    return null;
  }

  let offset = Math.sqrt(
    radiusSquared - perpendicularSquared
  );

  let hitDistance = projection - offset;

  if (
    hitDistance >= 0 &&
    hitDistance < wallDistance &&
    Math.abs(
      Math.atan2(
        tx * dy - ty * dx,
        projection
      )
    ) <= VISION_CONE_ANGLE
  ) {
    return hitDistance;
  }

  return null;
}

// --------------------------------------------------
// STATE ENCODING
// --------------------------------------------------

function getState(vision) {
  let targetRay = vision.bestRay + 1;

  let distanceBin = 0;

  if (vision.targetVisible) {
    let d = vision.bestDistance;

    if (d < 35) {
      distanceBin = 1;
    } else if (d < 80) {
      distanceBin = 2;
    } else if (d < 150) {
      distanceBin = 3;
    } else {
      distanceBin = 4;
    }
  }

  let wallBin = 0;

  if (vision.closestWall < 20) {
    wallBin = 1;
  } else if (vision.closestWall < 45) {
    wallBin = 2;
  } else if (vision.closestWall < 80) {
    wallBin = 3;
  }

  let speed = Math.sqrt(
    ai.vx * ai.vx + ai.vy * ai.vy
  );

  let speedBin = 0;

  if (speed > 0.8) {
    speedBin = 1;
  }

  if (speed > 1.8) {
    speedBin = 2;
  }

  let turnBin = 0;

  if (ai.turnSpeed < -0.012) {
    turnBin = 1;
  } else if (ai.turnSpeed > 0.012) {
    turnBin = 2;
  }

  return [
    targetRay,
    distanceBin,
    wallBin,
    speedBin,
    turnBin
  ].join(",");
}

// --------------------------------------------------
// Q-TABLE
// --------------------------------------------------

function getQValues(state) {
  if (!qTable.has(state)) {
    qTable.set(
      state,
      new Array(ACTIONS.length).fill(0)
    );
  }

  return qTable.get(state);
}

function getQValue(state, action) {
  let actionIndex = ACTIONS.indexOf(action);

  return getQValues(state)[actionIndex];
}

function setQValue(state, action, value) {
  let actionIndex = ACTIONS.indexOf(action);

  getQValues(state)[actionIndex] = value;
}

function getBestQValue(state) {
  return Math.max(...getQValues(state));
}

// --------------------------------------------------
// ACTION SELECTION
// --------------------------------------------------

function chooseAction(state) {
  if (random() < epsilon) {
    return random(ACTIONS);
  }

  let values = getQValues(state);

  let highest = Math.max(...values);

  let bestActions = [];

  for (let i = 0; i < values.length; i++) {
    if (values[i] === highest) {
      bestActions.push(ACTIONS[i]);
    }
  }

  return random(bestActions);
}

// --------------------------------------------------
// ACTION EXECUTION
// --------------------------------------------------

function applyAction(action) {
  if (
    action === "turnLeft" ||
    action === "forwardLeft"
  ) {
    ai.turnSpeed -= TURN_ACCELERATION;
  }

  if (
    action === "turnRight" ||
    action === "forwardRight"
  ) {
    ai.turnSpeed += TURN_ACCELERATION;
  }

  ai.turnSpeed = constrain(
    ai.turnSpeed,
    -MAX_TURN_SPEED,
    MAX_TURN_SPEED
  );

  if (
    action === "forward" ||
    action === "forwardLeft" ||
    action === "forwardRight"
  ) {
    ai.vx += Math.cos(ai.heading) * THRUST;
    ai.vy += Math.sin(ai.heading) * THRUST;
  }

  if (action === "brake") {
    ai.vx *= BRAKE_FRICTION;
    ai.vy *= BRAKE_FRICTION;
  }
}

// --------------------------------------------------
// PHYSICS
// --------------------------------------------------

function updatePhysics() {
  ai.heading += ai.turnSpeed;

  ai.heading = (
    ai.heading + Math.PI * 2
  ) % (Math.PI * 2);

  ai.turnSpeed *= TURN_FRICTION;

  ai.vx *= FRICTION;
  ai.vy *= FRICTION;

  let speed = Math.sqrt(
    ai.vx * ai.vx + ai.vy * ai.vy
  );

  if (speed > MAX_SPEED) {
    let speedScale = MAX_SPEED / speed;

    ai.vx *= speedScale;
    ai.vy *= speedScale;
  }

  ai.x += ai.vx;
  ai.y += ai.vy;

  // Bounce off left and right walls.
  if (ai.x < BALL_RADIUS) {
    ai.x = BALL_RADIUS;
    ai.vx = Math.abs(ai.vx) * 0.65;
  }

  if (ai.x > width - BALL_RADIUS) {
    ai.x = width - BALL_RADIUS;
    ai.vx = -Math.abs(ai.vx) * 0.65;
  }

  // Bounce off top and bottom walls.
  if (ai.y < BALL_RADIUS) {
    ai.y = BALL_RADIUS;
    ai.vy = Math.abs(ai.vy) * 0.65;
  }

  if (ai.y > height - BALL_RADIUS) {
    ai.y = height - BALL_RADIUS;
    ai.vy = -Math.abs(ai.vy) * 0.65;
  }
}

// --------------------------------------------------
// REWARD CALCULATION
// --------------------------------------------------

function calculateReward(oldVision, newVision) {
  let reward = STEP_PENALTY;

  // Reward discovering the target.
  if (
    !oldVision.targetVisible &&
    newVision.targetVisible
  ) {
    reward += DISCOVERY_REWARD;
  }

  // Reward improving alignment.
  if (newVision.targetVisible) {
    let oldAlignment =
      oldVision.targetVisible
        ? oldVision.bestAlignment
        : 0;

    let alignmentChange =
      newVision.bestAlignment - oldAlignment;

    reward += alignmentChange * ALIGNMENT_REWARD;
  }

  // Reward moving closer to the target.
  if (
    oldVision.targetVisible &&
    newVision.targetVisible
  ) {
    let distanceChange =
      oldVision.bestDistance -
      newVision.bestDistance;

    distanceChange = constrain(
      distanceChange,
      -3,
      3
    );

    reward += distanceChange * DISTANCE_REWARD;
  }

  // Penalize being very close to a wall.
  if (newVision.closestWall < 15) {
    reward -= WALL_PENALTY;
  }

  return reward;
}

// --------------------------------------------------
// CATCH DETECTION
// --------------------------------------------------

function checkCatch() {
  let d = dist(
    ai.x,
    ai.y,
    target.x,
    target.y
  );

  if (d < BALL_RADIUS + TARGET_RADIUS) {
    totalReward += CATCH_REWARD;
    lastReward = CATCH_REWARD;

    rewardHistory.push(CATCH_REWARD);

    if (rewardHistory.length > REWARD_HISTORY_LENGTH) {
      rewardHistory.shift();
    }

    catchCount++;
    totalMovesToCatch += episodeSteps;

    episodeSteps = 0;

    respawnTarget();

    saveTraining();
  }
}

// --------------------------------------------------
// ALIGNMENT HELPERS
// --------------------------------------------------

function getAlignmentScore(vision) {
  if (!vision.targetVisible) {
    return 0;
  }

  return vision.bestAlignment;
}

function getBestTargetDistance(vision) {
  if (!vision.targetVisible) {
    return null;
  }

  return vision.bestDistance;
}

// --------------------------------------------------
// DRAWING
// --------------------------------------------------

function drawTarget() {
  noStroke();

  fill(40, 190, 80);

  rectMode(CENTER);

  rect(
    target.x,
    target.y,
    TARGET_RADIUS * 2,
    TARGET_RADIUS * 2
  );

  rectMode(CORNER);
}

function drawAI() {
  push();

  translate(ai.x, ai.y);
  rotate(ai.heading);

  noStroke();

  fill(220, 55, 55);
  circle(0, 0, BALL_RADIUS * 2);

  // Small direction indicator.
  stroke(80, 0, 0);
  strokeWeight(2);

  line(
    0,
    0,
    BALL_RADIUS + 5,
    0
  );

  pop();
}

// --------------------------------------------------
// VISION RAYS
// --------------------------------------------------

function drawVision() {
  let vision = readVision();

  push();

  for (let ray of vision.rays) {
    let endDistance = ray.wallDistance;

    let rayColor;

    if (ray.seesTarget) {
      endDistance = ray.targetDistance;
      rayColor = color(30, 180, 70, 180);
    } else {
      rayColor = color(40, 120, 220, 65);
    }

    stroke(rayColor);
    strokeWeight(1);

    line(
      ai.x,
      ai.y,
      ai.x + ray.dx * endDistance,
      ai.y + ray.dy * endDistance
    );
  }

  pop();
}

// --------------------------------------------------
// HUD / STATISTICS
// --------------------------------------------------

function drawHUD() {
  let speed = Math.sqrt(
    ai.vx * ai.vx + ai.vy * ai.vy
  );

  let averageReward = 0;

  if (rewardHistory.length > 0) {
    let sum = rewardHistory.reduce(
      (a, b) => a + b,
      0
    );

    averageReward = sum / rewardHistory.length;
  }

  let averageMoves = catchCount > 0
    ? totalMovesToCatch / catchCount
    : 0;

  noStroke();

  fill(20, 20, 20, 215);
  //rect(8, 8, 210, 174, 7);

  fill(0);

  textSize(12);
  textAlign(LEFT, TOP);

  text("Q-LEARNING AGENT", 18, 17);

  textSize(11);

  text(
    "Catches: " + catchCount,
    18,
    39
  );

  text(
    "Steps: " + stepCount.toLocaleString(),
    18,
    55
  );

  text(
    "Total reward: " + totalReward.toFixed(1),
    18,
    71
  );

  text(
    "Last 1,000 avg: " + averageReward.toFixed(3),
    18,
    87
  );

  text(
    "Avg moves/catch: " + averageMoves.toFixed(0),
    18,
    103
  );

  text(
    "Exploration: " + (epsilon * 100).toFixed(1) + "%",
    18,
    119
  );

  text(
    "Speed: " + speed.toFixed(2),
    18,
    135
  );

  text(
    "Q-table states: " + qTable.size,
    18,
    151
  );

  if (paused) {
    fill(255, 180, 30);
    textSize(15);
    textAlign(CENTER, CENTER);
    text("PAUSED", width / 2, height - 20);
  }
}

// --------------------------------------------------
// SAVE / LOAD TRAINING
// --------------------------------------------------

function saveTraining() {
  try {
    let data = {
      qTable: Array.from(qTable.entries()),
      epsilon: epsilon,
      catchCount: catchCount,
      totalMovesToCatch: totalMovesToCatch,
      totalReward: totalReward,
      stepCount: stepCount
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  } catch (error) {
    console.warn("Could not save training:", error);
  }
}

function loadTraining() {
  try {
    let saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return;
    }

    let data = JSON.parse(saved);

    qTable = new Map(data.qTable || []);

    epsilon = data.epsilon ?? STARTING_EPSILON;
    catchCount = data.catchCount ?? 0;
    totalMovesToCatch = data.totalMovesToCatch ?? 0;
    totalReward = data.totalReward ?? 0;
    stepCount = data.stepCount ?? 0;

    console.log(
      "Loaded training:",
      qTable.size,
      "states"
    );
  } catch (error) {
    console.warn("Could not load training:", error);
  }
}

// --------------------------------------------------
// KEYBOARD CONTROLS
// --------------------------------------------------

function keyPressed() {
  if (key === " ") {
    paused = !paused;
    return false;
  }

  if (key === "v" || key === "V") {
    showVision = !showVision;
  }

  if (key === "r" || key === "R") {
    resetTraining();
  }
}

// --------------------------------------------------
// RESET
// --------------------------------------------------

function resetTraining() {
  qTable = new Map();

  epsilon = STARTING_EPSILON;

  totalReward = 0;
  stepCount = 0;
  catchCount = 0;

  totalMovesToCatch = 0;
  episodeSteps = 0;

  rewardHistory = [];

  previousAlignment = 0;
  previousDistance = null;
  previousVisible = false;

  ai.x = width / 2;
  ai.y = height / 2;

  ai.vx = 0;
  ai.vy = 0;

  ai.heading = 0;
  ai.turnSpeed = 0;

  target = createTarget();

  previousVision = readVision();

  localStorage.removeItem(STORAGE_KEY);

  console.log("Training reset.");
}
