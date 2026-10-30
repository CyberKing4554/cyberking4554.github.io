
let score = 0;
let catches = 0;
let steps = 0;

let targetX = 0;
let targetY = 0;
let aiX = 0;
let aiY = 0;

const AI_SIZE = 6;
const TARGET_SIZE = 6;
const SPEED = 1;

const ACTIONS = [
  [1, 0],    // Right
  [-1, 0],   // Left
  [0, 1],    // Down
  [0, -1],   // Up
  [1, 1],    // Down-right
  [1, -1],   // Up-right
  [-1, 1],   // Down-left
  [-1, -1]   // Up-left
];

const LEARNING_RATE = 0.15;
const DISCOUNT = 0.95;
const START_EPSILON = 0.30;
const MIN_EPSILON = 0.005;
const EPSILON_DECAY = 0.995;

let epsilon = START_EPSILON;

// Q-table: 11 x 11 relative-position states,
// each with 8 possible actions.
let qTable = [];

let lastReward = 0;
let totalReward = 0;
let bestScore = 0;
let episodeSteps = 0;

function setup() {
  createCanvas(400, 400);

  for (let x = 0; x < 11; x++) {
    qTable[x] = [];
    for (let y = 0; y < 11; y++) {
      qTable[x][y] = Array(8).fill(0);
    }
  }

  aiX = 0;
  aiY = 0;
  spawnTarget();
}

function draw() {
  background(220);

  // Learn several transitions each frame for faster training.
  // Rendering still happens normally.
  for (let i = 0; i < 4; i++) {
    trainStep();
  }

  push();
  translate(width / 2, height / 2);

  // Green target
  fill(0, 255, 0);
  rect(targetX, targetY, TARGET_SIZE, TARGET_SIZE);

  // Red AI circle
  fill(255, 0, 0);
  circle(aiX, aiY, AI_SIZE);

  pop();

  // Training statistics
  fill(0);
  textAlign(LEFT, TOP);
  textSize(13);

  text("Catches: " + catches, 10, 10);
  text("Total reward: " + Math.round(totalReward), 10, 28);
  text("Last reward: " + lastReward.toFixed(2), 10, 46);
  text("Exploration: " + (epsilon * 100).toFixed(1) + "%", 10, 64);
  text("Steps this target: " + episodeSteps, 10, 82);
  text("Best score: " + bestScore, 10, 100);
}

// Convert the target's relative position into a discrete state.
// Each axis has 11 bins, from -5 to +5.
function getState() {
  let centerX = targetX + TARGET_SIZE / 2;
  let centerY = targetY + TARGET_SIZE / 2;

  let dx = centerX - aiX;
  let dy = centerY - aiY;

  let sx = constrain(Math.floor(dx / 40) + 5, 0, 10);
  let sy = constrain(Math.floor(dy / 40) + 5, 0, 10);

  return [sx, sy];
}

function chooseAction(state) {
  // Exploration: occasionally try a random action.
  if (random() < epsilon) {
    return floor(random(ACTIONS.length));
  }

  // Exploitation: choose the best known action.
  let values = qTable[state[0]][state[1]];
  let bestValue = Math.max(...values);

  // Randomly break ties to avoid a directional bias.
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

  let oldX = aiX;
  let oldY = aiY;

  // Execute the chosen action.
  let move = ACTIONS[action];
  let magnitude = Math.hypot(move[0], move[1]);

  aiX += (move[0] / magnitude) * SPEED;
  aiY += (move[1] / magnitude) * SPEED;

  // Keep the circle inside the canvas.
  let hitWall = false;

  let newX = constrain(
    aiX,
    -width / 2 + AI_SIZE / 2,
    width / 2 - AI_SIZE / 2
  );

  let newY = constrain(
    aiY,
    -height / 2 + AI_SIZE / 2,
    height / 2 - AI_SIZE / 2
  );

  if (newX !== aiX || newY !== aiY) {
    hitWall = true;
  }

  aiX = newX;
  aiY = newY;

  steps++;
  episodeSteps++;

  let newDistance = distanceToTarget();
  let caught = isColliding();

  // -------------------------------
  // REWARD / PUNISHMENT SYSTEM
  // -------------------------------
  
  let reward = 0;

  // Encourage progress toward the target.
  // Normalize so reward magnitudes remain manageable.
  let progress = oldDistance - newDistance;
  reward += constrain(progress / SPEED, -1, 1);

  // Small cost for every action encourages efficiency.
  reward -= 0.1;

  // Penalize bumping into canvas boundaries.
  if (hitWall) {
    reward -= 5;
  }

  // Catching the target is the main objective.
  if (caught) {
    let speedBonus = Math.max(0, 20 - episodeSteps * 0.05);
    reward += 100 + speedBonus;

    catches++;
    bestScore = Math.max(bestScore, episodeSteps);
  }
  // -------------------------------
  // Q-LEARNING UPDATE
  // -------------------------------

  let nextState = getState();

  let currentQ = qTable[state[0]][state[1]][action];

  let maxNextQ = Math.max(
    ...qTable[nextState[0]][nextState[1]]
  );

  // A successful catch completes this learning episode.
  // The agent and its Q-table are retained for the next target.
  let futureValue = caught ? 0 : maxNextQ;

  let updatedQ =
    currentQ +
    LEARNING_RATE *
      (reward + DISCOUNT * futureValue - currentQ);

  qTable[state[0]][state[1]][action] = updatedQ;

  lastReward = reward;
  totalReward += reward;

  // A catch starts a new episode, not a stopped program.
  if (caught) {
    spawnTarget();
    episodeSteps = 0;

    // Gradually reduce random exploration as it learns.
    epsilon = Math.max(
      MIN_EPSILON,
      START_EPSILON * Math.pow(0.98, catches)
    );
  }
}

function distanceToTarget() {
  let centerX = targetX + TARGET_SIZE / 2;
  let centerY = targetY + TARGET_SIZE / 2;

  return dist(aiX, aiY, centerX, centerY);
}

function isColliding() {
  // Closest point on the square to the circle's center.
  let closestX = constrain(
    aiX,
    targetX,
    targetX + TARGET_SIZE
  );

  let closestY = constrain(
    aiY,
    targetY,
    targetY + TARGET_SIZE
  );

  return dist(aiX, aiY, closestX, closestY) <= AI_SIZE / 2;
}

function spawnTarget() {
  // Keep the entire square inside the canvas.
  targetX = random(
    -width / 2,
    width / 2 - TARGET_SIZE
  );

  targetY = random(
    -height / 2,
    height / 2 - TARGET_SIZE
  );
}

// Press R to reset learning and start over.
function keyPressed() {
  if (key === "r" || key === "R") {
    score = 0;
    catches = 0;
    steps = 0;
    totalReward = 0;
    lastReward = 0;
    bestScore = 0;
    episodeSteps = 0;
    epsilon = START_EPSILON;

    for (let x = 0; x < 11; x++) {
      for (let y = 0; y < 11; y++) {
        qTable[x][y].fill(0);
      }
    }

    aiX = 0;
    aiY = 0;
    spawnTarget();
  }
}
