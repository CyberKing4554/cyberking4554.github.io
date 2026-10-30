let catches = 0;
let steps = 0;

let targetX = 0;
let targetY = 0;
let aiX = 0;
let aiY = 0;

const AI_SIZE = 6;
const TARGET_SIZE = 6;
const SPEED = 1;

// Eight possible actions
const ACTIONS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

// Learning settings
const LEARNING_RATE = 0.10;
const DISCOUNT = 0.98;

const START_EPSILON = 0.3;
const MIN_EPSILON = 0.01;
const EPSILON_DECAY = 0.9999;

let epsilon = START_EPSILON;

// Reward settings
const STEP_PENALTY = 0.2;
const PROGRESS_REWARD = 0.8;
const WALL_PENALTY = 2;
const CATCH_REWARD = 100;

// State resolution: 20-pixel position bins
const BIN_SIZE = 20;
const BINS = 41;
const WALL_STATES = 16;

let qTable = [];

let lastReward = 0;
let totalReward = 0;
let bestScore = 0;
let episodeSteps = 0;

let recentMoves = [];
const RECENT_LIMIT = 50;

function setup() {
  createCanvas(400, 400);

  initializeQTable();

  aiX = 0;
  aiY = 0;

  spawnTarget();
}

function initializeQTable() {
  qTable = [];

  for (let x = 0; x < BINS; x++) {
    qTable[x] = [];

    for (let y = 0; y < BINS; y++) {
      qTable[x][y] = [];

      for (let w = 0; w < WALL_STATES; w++) {
        qTable[x][y][w] = Array(ACTIONS.length).fill(0);
      }
    }
  }
}

function draw() {
  background(220);

  // Train several times per rendered frame.
  for (let i = 0; i < 4; i++) {
    trainStep();
  }

  push();
  translate(width / 2, height / 2);
  //noStroke();

  fill(0, 255, 0);
  rect(targetX, targetY, TARGET_SIZE, TARGET_SIZE);

  fill(255, 0, 0);
  circle(aiX, aiY, AI_SIZE);

  pop();

  let averageMoves =
    recentMoves.length > 0
      ? recentMoves.reduce((sum, n) => sum + n, 0) / recentMoves.length
      : 0;

  fill(0);
  textAlign(LEFT, TOP);
  textSize(12);

  text("Catches: " + catches, 10, 10);
  text("Total reward: " + totalReward.toFixed(1), 10, 27);
  text("Last reward: " + lastReward.toFixed(2), 10, 44);
  text("Exploration: " + (epsilon * 100).toFixed(2) + "%", 10, 61);
  text("Current moves: " + episodeSteps, 10, 78);
  text("Fewest moves: " + (bestScore || "-"), 10, 95);
  text(
    "Average moves (last " +
      recentMoves.length +
      "): " +
      (recentMoves.length ? averageMoves.toFixed(1) : "-"),
    10,
    112
  );
}

function getState() {
  // Target position relative to the circle.
  let centerX = targetX + TARGET_SIZE / 2;
  let centerY = targetY + TARGET_SIZE / 2;

  let dx = centerX - aiX;
  let dy = centerY - aiY;

  let sx = constrain(Math.floor((dx + width) / BIN_SIZE), 0, BINS - 1);

  let sy = constrain(Math.floor((dy + height) / BIN_SIZE), 0, BINS - 1);

  // Also tell the agent when it is close to a wall.
  let minX = -width / 2 + AI_SIZE / 2;
  let maxX = width / 2 - AI_SIZE / 2;
  let minY = -height / 2 + AI_SIZE / 2;
  let maxY = height / 2 - AI_SIZE / 2;

  let wallCode = 0;

  if (aiX - minX < 10) wallCode |= 1;
  if (maxX - aiX < 10) wallCode |= 2;
  if (aiY - minY < 10) wallCode |= 4;
  if (maxY - aiY < 10) wallCode |= 8;

  return [sx, sy, wallCode];
}

function chooseAction(state) {
  // Exploration: occasionally try an unfamiliar action.
  if (random() < epsilon) {
    return floor(random(ACTIONS.length));
  }

  let values = qTable[state[0]][state[1]][state[2]];
  let bestValue = Math.max(...values);

  // Randomly break ties between equally valued actions.
  let bestActions = [];

  for (let a = 0; a < values.length; a++) {
    if (Math.abs(values[a] - bestValue) < 0.000001) {
      bestActions.push(a);
    }
  }

  return random(bestActions);
}

function trainStep() {
  let state = getState();
  let action = chooseAction(state);

  let oldDistance = distanceToTarget();

  // Execute the selected action.
  let move = ACTIONS[action];
  let magnitude = Math.hypot(move[0], move[1]);

  aiX += (move[0] / magnitude) * SPEED;
  aiY += (move[1] / magnitude) * SPEED;

  // Keep the circle inside the canvas.
  let minX = -width / 2 + AI_SIZE / 2;
  let maxX = width / 2 - AI_SIZE / 2;
  let minY = -height / 2 + AI_SIZE / 2;
  let maxY = height / 2 - AI_SIZE / 2;

  let newX = constrain(aiX, minX, maxX);
  let newY = constrain(aiY, minY, maxY);

  let hitWall = newX !== aiX || newY !== aiY;

  aiX = newX;
  aiY = newY;

  steps++;
  episodeSteps++;

  let newDistance = distanceToTarget();
  let caught = isColliding();

  // ------------------------------------
  // REWARD SYSTEM
  // ------------------------------------

  // Every move has a small cost.
  let reward = -STEP_PENALTY;

  // Reward progress and penalize moving away.
  let progress = oldDistance - newDistance;

  reward += PROGRESS_REWARD * progress;

  // Penalize hitting boundaries.
  if (hitWall) {
    reward -= WALL_PENALTY;
  }

  // Catching the target is the main objective.
  if (caught) {
    reward += CATCH_REWARD;
  }

  // ------------------------------------
  // Q-LEARNING UPDATE
  // ------------------------------------

  let nextState = getState();

  let currentQ = qTable[state[0]][state[1]][state[2]][action];

  let maxNextQ = Math.max(...qTable[nextState[0]][nextState[1]][nextState[2]]);

  // A catch ends this episode, not the training.
  let futureValue = caught ? 0 : maxNextQ;

  let updatedQ =
    currentQ + LEARNING_RATE * (reward + DISCOUNT * futureValue - currentQ);

  qTable[state[0]][state[1]][state[2]][action] = updatedQ;

  lastReward = reward;
  totalReward += reward;

  // Reduce exploration gradually after every action.
  epsilon = Math.max(MIN_EPSILON, epsilon * EPSILON_DECAY);

  // ------------------------------------
  // SUCCESSFUL CATCH
  // ------------------------------------

  if (caught) {
    catches++;

    if (bestScore === 0 || episodeSteps < bestScore) {
      bestScore = episodeSteps;
    }

    recentMoves.push(episodeSteps);

    if (recentMoves.length > RECENT_LIMIT) {
      recentMoves.shift();
    }

    episodeSteps = 0;

    // Keep learned Q-values for the next target.
    spawnTarget();
  }
}

function distanceToTarget() {
  let centerX = targetX + TARGET_SIZE / 2;
  let centerY = targetY + TARGET_SIZE / 2;

  return dist(aiX, aiY, centerX, centerY);
}

function isColliding() {
  let closestX = constrain(aiX, targetX, targetX + TARGET_SIZE);

  let closestY = constrain(aiY, targetY, targetY + TARGET_SIZE);

  return dist(aiX, aiY, closestX, closestY) <= AI_SIZE / 2;
}

function spawnTarget() {
  targetX = random(-width / 2, width / 2 - TARGET_SIZE);

  targetY = random(-height / 2, height / 2 - TARGET_SIZE);
}

// Press R to reset all learning and statistics.
function keyPressed() {
  if (key === "r" || key === "R") {
    catches = 0;
    steps = 0;
    totalReward = 0;
    lastReward = 0;
    bestScore = 0;
    episodeSteps = 0;
    recentMoves = [];

    epsilon = START_EPSILON;

    initializeQTable();

    aiX = 0;
    aiY = 0;

    spawnTarget();
  }
}
