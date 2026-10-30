
const CANVAS_SIZE = 400;

const AI_SIZE = 20;
const TARGET_SIZE = 20;

const PI_VALUE = Math.PI;
const TWO_PI_VALUE = Math.PI * 2;
const HALF_PI_VALUE = Math.PI / 2;

const MAX_SPEED = 2.8;
const THRUST = 0.06;
const FRICTION = 0.985;
const BRAKE_FRICTION = 0.88;

const TURN_ACCELERATION = 0.005;
const MAX_TURN_SPEED = 0.045;
const TURN_FRICTION = 0.90;

const LEARNING_RATE = 0.12;
const DISCOUNT = 0.97;

const START_EXPLORATION = 0.35;
const MIN_EXPLORATION = 0.03;
const EXPLORATION_DECAY = 0.99998;

const CATCH_REWARD = 150;
const STEP_PENALTY = -0.08;

const VISION_REWARD = 0.5;
const ALIGNMENT_REWARD = 1.2;
const VISION_DISTANCE_REWARD = 0.015;

const WALL_PENALTY = 2.0;
const WALL_DANGER_DISTANCE = 35;

const MAX_VISION_DISTANCE = 240;
const VISION_CONE_ANGLE = Math.PI / 15;

const STUCK_THRESHOLD = 180;

var ai = null;
var target = null;

var qTable = new Map();

var catches = 0;
var totalReward = 0;
var lastReward = 0;
var totalSteps = 0;
var episodeSteps = 0;

var exploration = START_EXPLORATION;

var bestMoves = null;
var episodeMoveHistory = [];

var stuckCounter = 0;
var bestRecentVision = 0;

var previousVision = null;
var showVision = true;
var trainingPaused = false;

const RAY_ANGLES = [
  -HALF_PI_VALUE,
  -PI_VALUE / 3,
  -PI_VALUE / 6,
  0,
  PI_VALUE / 6,
  PI_VALUE / 3,
  HALF_PI_VALUE
];

const ACTIONS = [
  { thrust: 0, turn: 0, brake: false },
  { thrust: 0, turn: -1, brake: false },
  { thrust: 0, turn: 1, brake: false },
  { thrust: 1, turn: 0, brake: false },
  { thrust: 1, turn: -1, brake: false },
  { thrust: 1, turn: 1, brake: false },
  { thrust: 0, turn: 0, brake: true }
];

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);

  ai = {
    x: width / 2,
    y: height / 2,
    vx: 0,
    vy: 0,
    angle: random(TWO_PI),
    angularVelocity: 0
  };

  spawnTarget();

  previousVision = readVision();

  frameRate(60);
}

function draw() {
  background(250);

  if (!trainingPaused) {
    for (let i = 0; i < 4; i++) {
      trainStep();
    }
  }

  if (showVision) {
    drawVision();
  }

  drawTarget();
  drawAI();
  drawStats();
  drawPauseIndicator();
}

// --------------------------------------------------
// TRAINING
// --------------------------------------------------

function trainStep() {
  totalSteps++;
  episodeSteps++;

  const oldVision = readVision();
  const state = getState(oldVision);

  const actionIndex = chooseAction(state);

  applyPhysics(ACTIONS[actionIndex]);

  const newVision = readVision();

  let reward = STEP_PENALTY;

  // Reward discovering the target.
  if (!oldVision.seesTarget && newVision.seesTarget) {
    reward += VISION_REWARD;
  }

  // Reward improving target alignment.
  const alignmentChange =
    newVision.alignmentScore - oldVision.alignmentScore;

  reward += alignmentChange * ALIGNMENT_REWARD;

  // Reward approaching the target while it is visible.
  if (oldVision.seesTarget && newVision.seesTarget) {
    const distanceChange =
      oldVision.targetDistance - newVision.targetDistance;

    reward += constrain(
      distanceChange,
      -3,
      3
    ) * VISION_DISTANCE_REWARD;
  }

  // Wall avoidance.
  reward += calculateWallPenalty();

  // Detect lack of progress.
  if (newVision.alignmentScore > bestRecentVision + 0.05) {
    bestRecentVision = newVision.alignmentScore;
    stuckCounter = 0;
  } else {
    stuckCounter++;
  }

  // Encourage changing direction when stuck.
  if (stuckCounter > STUCK_THRESHOLD) {
    reward -= 0.4;

    if (stuckCounter % 35 === 0) {
      ai.angularVelocity += random([-0.025, 0.025]);

      ai.angularVelocity = constrain(
        ai.angularVelocity,
        -MAX_TURN_SPEED,
        MAX_TURN_SPEED
      );
    }
  }

  const caught = checkCatch();

  if (caught) {
    reward += CATCH_REWARD;
    catches++;

    bestMoves = bestMoves === null
      ? episodeSteps
      : min(bestMoves, episodeSteps);

    episodeMoveHistory.push(episodeSteps);

    if (episodeMoveHistory.length > 20) {
      episodeMoveHistory.shift();
    }

    spawnTarget();

    episodeSteps = 0;
    stuckCounter = 0;
    bestRecentVision = 0;
  }

  const nextVision = caught
    ? readVision()
    : newVision;

  const nextState = getState(nextVision);

  updateQTable(
    state,
    actionIndex,
    reward,
    nextState,
    caught
  );

  lastReward = reward;
  totalReward += reward;

  // Gradually decrease exploration.
  exploration = max(
    MIN_EXPLORATION,
    START_EXPLORATION *
    pow(EXPLORATION_DECAY, totalSteps)
  );

  previousVision = nextVision;
}

// --------------------------------------------------
// PHYSICS
// --------------------------------------------------

function applyPhysics(action) {
  ai.angularVelocity +=
    action.turn * TURN_ACCELERATION;

  ai.angularVelocity = constrain(
    ai.angularVelocity,
    -MAX_TURN_SPEED,
    MAX_TURN_SPEED
  );

  ai.angularVelocity *= TURN_FRICTION;
  ai.angle += ai.angularVelocity;

  // Forward acceleration.
  if (action.thrust > 0) {
    ai.vx += cos(ai.angle) * THRUST;
    ai.vy += sin(ai.angle) * THRUST;
  }

  // Friction or braking.
  const friction = action.brake
    ? BRAKE_FRICTION
    : FRICTION;

  ai.vx *= friction;
  ai.vy *= friction;

  // Maximum speed.
  const speed = getSpeed();

  if (speed > MAX_SPEED) {
    const speedScale = MAX_SPEED / speed;

    ai.vx *= speedScale;
    ai.vy *= speedScale;
  }

  ai.x += ai.vx;
  ai.y += ai.vy;

  handleWalls();
}

function handleWalls() {
  const radius = AI_SIZE / 2;

  if (ai.x < radius) {
    ai.x = radius;
    if (ai.vx < 0) ai.vx = 0;
  }

  if (ai.x > width - radius) {
    ai.x = width - radius;
    if (ai.vx > 0) ai.vx = 0;
  }

  if (ai.y < radius) {
    ai.y = radius;
    if (ai.vy < 0) ai.vy = 0;
  }

  if (ai.y > height - radius) {
    ai.y = height - radius;
    if (ai.vy > 0) ai.vy = 0;
  }
}

function calculateWallPenalty() {
  let penalty = 0;

  const radius = AI_SIZE / 2;

  const walls = [
    { distance: ai.x - radius, speed: max(0, -ai.vx) },
    { distance: width - radius - ai.x, speed: max(0, ai.vx) },
    { distance: ai.y - radius, speed: max(0, -ai.vy) },
    { distance: height - radius - ai.y, speed: max(0, ai.vy) }
  ];

  for (const wall of walls) {
    const danger = constrain(
      (WALL_DANGER_DISTANCE - wall.distance) /
      WALL_DANGER_DISTANCE,
      0,
      1
    );

    penalty -= WALL_PENALTY * danger * wall.speed;
  }

  return penalty;
}

function getSpeed() {
  return sqrt(ai.vx * ai.vx + ai.vy * ai.vy);
}

// --------------------------------------------------
// VISION
// --------------------------------------------------

function readVision() {
  const rays = [];

  let bestRay = -1;
  let bestAlignment = 0;
  let nearestTargetDistance = Infinity;

  for (let i = 0; i < RAY_ANGLES.length; i++) {
    const angle = ai.angle + RAY_ANGLES[i];

    const wallDistance = raycastWall(angle);
    const targetDistance = raycastTarget(angle);

    const seesTarget =
      targetDistance !== null &&
      targetDistance < wallDistance &&
      targetDistance < MAX_VISION_DISTANCE;

    let visibleDistance = null;

    if (seesTarget) {
      visibleDistance = targetDistance;

      nearestTargetDistance = min(
        nearestTargetDistance,
        targetDistance
      );

      const alignment = 1 - abs(i - 3) / 4;

      const distanceFactor = map(
        targetDistance,
        0,
        MAX_VISION_DISTANCE,
        1,
        0.5,
        true
      );

      const score = alignment * distanceFactor;

      if (score > bestAlignment) {
        bestAlignment = score;
        bestRay = i;
      }
    }

    rays.push({
      seesTarget,
      targetDistance: visibleDistance,
      wallDistance
    });
  }

  return {
    rays,
    seesTarget: bestRay !== -1,
    bestRay,
    alignmentScore: bestAlignment,
    targetDistance: nearestTargetDistance
  };
}

function raycastWall(angle) {
  const dx = cos(angle);
  const dy = sin(angle);

  const radius = AI_SIZE / 2;

  let distance = Infinity;

  if (dx > 0) {
    distance = min(
      distance,
      (width - radius - ai.x) / dx
    );
  } else if (dx < 0) {
    distance = min(
      distance,
      (radius - ai.x) / dx
    );
  }

  if (dy > 0) {
    distance = min(
      distance,
      (height - radius - ai.y) / dy
    );
  } else if (dy < 0) {
    distance = min(
      distance,
      (radius - ai.y) / dy
    );
  }

  return max(0, distance);
}

function raycastTarget(angle) {
  const dx = target.x - ai.x;
  const dy = target.y - ai.y;

  const targetAngle = atan2(dy, dx);
  const relativeAngle = normalizeAngle(targetAngle - angle);

  const centerDistance = sqrt(dx * dx + dy * dy);

  const targetRadius =
    sqrt(2) * TARGET_SIZE / 2 + AI_SIZE / 2;

  const allowedAngle =
    VISION_CONE_ANGLE +
    asin(min(1, targetRadius / max(centerDistance, 0.001)));

  if (abs(relativeAngle) > allowedAngle) {
    return null;
  }

  const projectedDistance =
    centerDistance * cos(relativeAngle);

  if (projectedDistance <= 0) {
    return null;
  }

  const hitDistance = max(
    0,
    projectedDistance - targetRadius
  );

  if (hitDistance > MAX_VISION_DISTANCE) {
    return null;
  }

  return hitDistance;
}

function normalizeAngle(angle) {
  while (angle > PI_VALUE) angle -= TWO_PI_VALUE;
  while (angle < -PI_VALUE) angle += TWO_PI_VALUE;

  return angle;
}

// --------------------------------------------------
// Q-LEARNING STATE
// --------------------------------------------------

function getState(vision) {
  const sensorStates = [];

  for (const ray of vision.rays) {
    const targetBin = ray.seesTarget
      ? distanceBin(ray.targetDistance)
      : 0;

    const wallBin = wallDistanceBin(ray.wallDistance);

    sensorStates.push(targetBin);
    sensorStates.push(wallBin);
  }

  const speedBin = bin(
    getSpeed(),
    0,
    MAX_SPEED,
    4
  );

  const turnBin = bin(
    ai.angularVelocity,
    -MAX_TURN_SPEED,
    MAX_TURN_SPEED,
    5
  );

  return [
    ...sensorStates,
    speedBin,
    turnBin
  ].join(",");
}

function distanceBin(distance) {
  if (distance < 25) return 1;
  if (distance < 60) return 2;
  if (distance < 120) return 3;
  return 4;
}

function wallDistanceBin(distance) {
  if (distance < 12) return 0;
  if (distance < 25) return 1;
  if (distance < 50) return 2;
  return 3;
}

function bin(value, minValue, maxValue, bins) {
  const normalized = constrain(
    (value - minValue) / (maxValue - minValue),
    0,
    0.999999
  );

  return floor(normalized * bins);
}

// --------------------------------------------------
// Q-LEARNING
// --------------------------------------------------

function chooseAction(state) {
  const values = getQValues(state);

  if (random() < exploration) {
    return floor(random(ACTIONS.length));
  }

  let bestAction = 0;
  let bestValue = -Infinity;

  for (let i = 0; i < values.length; i++) {
    if (values[i] > bestValue) {
      bestValue = values[i];
      bestAction = i;
    }
  }

  return bestAction;
}

function getQValues(state) {
  if (!qTable.has(state)) {
    qTable.set(
      state,
      new Array(ACTIONS.length).fill(0)
    );
  }

  return qTable.get(state);
}

function updateQTable(
  state,
  action,
  reward,
  nextState,
  terminal
) {
  const values = getQValues(state);
  const nextValues = getQValues(nextState);

  const oldValue = values[action];

  const futureValue = terminal
    ? 0
    : max(...nextValues);

  values[action] +=
    LEARNING_RATE *
    (
      reward +
      DISCOUNT * futureValue -
      oldValue
    );
}

// --------------------------------------------------
// CATCHING
// --------------------------------------------------

function checkCatch() {
  const closestX = constrain(
    ai.x,
    target.x - TARGET_SIZE / 2,
    target.x + TARGET_SIZE / 2
  );

  const closestY = constrain(
    ai.y,
    target.y - TARGET_SIZE / 2,
    target.y + TARGET_SIZE / 2
  );

  const dx = ai.x - closestX;
  const dy = ai.y - closestY;

  return sqrt(dx * dx + dy * dy) <= AI_SIZE / 2;
}

function spawnTarget() {
  let attempts = 0;

  do {
    target = {
      x: random(30, width - 30),
      y: random(30, height - 30)
    };

    attempts++;
  } while (
    dist(target.x, target.y, ai.x, ai.y) < 80 &&
    attempts < 100
  );
}

// --------------------------------------------------
// DRAWING
// --------------------------------------------------

function drawVision() {
  const vision = readVision();

  for (let i = 0; i < RAY_ANGLES.length; i++) {
    const angle = ai.angle + RAY_ANGLES[i];
    const ray = vision.rays[i];

    const wallDistance = min(
      ray.wallDistance,
      MAX_VISION_DISTANCE
    );

    let rayLength = wallDistance;

    if (
      ray.seesTarget &&
      ray.targetDistance < wallDistance
    ) {
      rayLength = ray.targetDistance;
      stroke(0, 190, 40, 190);
    } else {
      stroke(80, 130, 220, 100);
    }

    strokeWeight(i === 3 ? 1.8 : 1);

    line(
      ai.x,
      ai.y,
      ai.x + cos(angle) * rayLength,
      ai.y + sin(angle) * rayLength
    );
  }
}

function drawAI() {
  push();

  translate(ai.x, ai.y);
  rotate(ai.angle);

  noStroke();
  fill(230, 45, 45);
  circle(0, 0, AI_SIZE);

  stroke(120, 0, 0);
  strokeWeight(1);
  line(0, 0, AI_SIZE, 0);

  pop();
}

function drawTarget() {
  noStroke();
  fill(0, 190, 30);

  rectMode(CENTER);
  rect(
    target.x,
    target.y,
    TARGET_SIZE,
    TARGET_SIZE
  );

  rectMode(CORNER);
}

function drawStats() {
  fill(30);
  noStroke();
  textSize(11);
  textAlign(LEFT, TOP);

  const averageMoves = episodeMoveHistory.length > 0
    ? (
        episodeMoveHistory.reduce((a, b) => a + b, 0) /
        episodeMoveHistory.length
      ).toFixed(1)
    : "0.0";

  const vision = readVision();

  const stats = [
    `Catches: ${catches}`,
    `Total reward: ${totalReward.toFixed(1)}`,
    `Last reward: ${lastReward.toFixed(2)}`,
    `Exploration: ${(exploration * 100).toFixed(2)}%`,
    `Total steps: ${totalSteps}`,
    `Current moves: ${episodeSteps}`,
    `Fewest moves: ${bestMoves ?? "-"}`,
    `Average moves: ${averageMoves}`,
    `Speed: ${getSpeed().toFixed(2)}`,
    `Target visible: ${vision.seesTarget ? "YES" : "NO"}`,
    `Learned states: ${qTable.size}`
  ];

  let y = 10;

  for (const line of stats) {
    text(line, 10, y);
    y += 16;
  }

  textAlign(RIGHT, TOP);

  text(
    "V: vision | SPACE: pause | R: reset",
    width - 8,
    10
  );
}

function drawPauseIndicator() {
  if (trainingPaused) {
    fill(0);
    textSize(15);
    textAlign(CENTER, CENTER);

    text(
      "PAUSED — press SPACE to resume",
      width / 2,
      height - 20
    );
  }
}

// --------------------------------------------------
// CONTROLS
// --------------------------------------------------

function keyPressed() {
  if (key === " ") {
    trainingPaused = !trainingPaused;
  }

  if (key === "r" || key === "R") {
    resetTraining();
  }

  if (key === "v" || key === "V") {
    showVision = !showVision;
  }
}

function resetTraining() {
  qTable.clear();

  catches = 0;
  totalReward = 0;
  lastReward = 0;
  totalSteps = 0;
  episodeSteps = 0;

  exploration = START_EXPLORATION;

  bestMoves = null;
  episodeMoveHistory = [];

  stuckCounter = 0;
  bestRecentVision = 0;

  ai.x = width / 2;
  ai.y = height / 2;
  ai.vx = 0;
  ai.vy = 0;
  ai.angle = random(TWO_PI);
  ai.angularVelocity = 0;

  spawnTarget();

  previousVision = readVision();
}
