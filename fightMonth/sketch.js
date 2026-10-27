
/*
  FIGHT MONTH — Cancer Fundraiser
  Designed for p5.js 2.3.4
  Mobile-friendly, animated, and easy to customize.
*/

// ===== FUNDRAISING SETTINGS =====
let amountRaised = 0;
let fundraisingGoal = 5000;

// Edit the amounts and descriptions to match your fundraiser.
let goals = [
  {
    amount: 1800,
    icon: "🎀",
    title: "Temporary Dye",
    description: "A group of student volenteers temporarily dyes their hair.",
    color: "#F47AA8"
  },
  {
    amount: 2500,
    icon: "🏥",
    title: "Hair Buzz",
    description: "Student volunteers buzz their heads.",
    color: "#70D5CE"
  },
  {
    amount: 2800,
    icon: "❤️‍🩹",
    title: "Buzz + Hair Dye",
    description: "Student volunteers buzzes and dyes their hair.",
    color: "#ffffff"
  },
  {
    amount: 5000,
    icon: "🎗",
    title: "Staff Buzz/Dye",
    description: "Staff volunteers buzzes and/or dyes hair.",
    color: "#FFD166"
  }
];

let particles = [];
let moneyPieces = [];
let animationProgress = 0;
let lastRaised = -1;
let canvasWidth = 700;
let canvasHeight = 1160;

function setup() {
  
  pixelDensity(min(window.devicePixelRatio || 1, 2));

  let w = min(windowWidth, 700);
  createCanvas(w, w * canvasHeight / canvasWidth);
  //console.log(width/2);
  textFont("sans-serif");
  textAlign(CENTER, CENTER);

  for (let i = 0; i < 30; i++) {
    particles.push({
      x: random(700),
      y: random(1160),
      size: random(2, 5),
      speed: random(0.3, 1.1),
      phase: random(TWO_PI)
    });
  }

  for (let i = 0; i < 16; i++) {
    moneyPieces.push({
      x: random(35, 665),
      y: random(120, 570),
      rotation: random(TWO_PI),
      speed: random(0.003, 0.012),
      size: random(0.7, 1.15),
      phase: random(TWO_PI)
    });
  }
}

function draw() {
  let s = width / 700;
  animationProgress = min(animationProgress + 0.025, 1);

  push();
  scale(s);

  drawBackground();
  drawDecorations();
  drawHeader();
  drawJar();
  drawRaisedAmount();
  drawGoals();
  drawFooter();

  pop();
}

function drawBackground() {
  background("#0a2140");

  // Soft glowing circles
  noStroke();
  for (let i = 0; i < 5; i++) {
    let x = [70, 620, 570, 100, 350][i];
    let y = [210, 350, 760, 900, 1050][i];
    let d = 120 + sin(frameCount * 0.02 + i) * 15;

    fill(75, 92, 180, 12);
    circle(x, y, d);
  }

  // Subtle stars
  for (let p of particles) {
    let twinkle = 0.3 + abs(sin(frameCount * 0.025 + p.phase)) * 0.7;
    fill(210, 225, 255, 100 * twinkle);
    circle(p.x, p.y, p.size);
    p.y -= p.speed;

    if (p.y < -5) {
      p.y = 1165;
      p.x = random(700);
    }
  }
}

function drawDecorations() {
  // Floating banknotes behind the jar
  for (let i = 0; i < moneyPieces.length; i++) {
    let m = moneyPieces[i];
    let x = m.x + sin(frameCount * 0.018 + m.phase) * 10;
    let y = m.y + sin(frameCount * 0.025 + m.phase) * 9;

    push();
    translate(x, y);
    rotate(sin(frameCount * m.speed + m.phase) * 0.15);
    scale(m.size);

    fill(70, 180, 155, 25);
    stroke(100, 230, 190, 65);
    strokeWeight(1.5);
    rect(-22, -11, 44, 22, 4);

    noStroke();
    fill(100, 230, 190, 65);
    circle(0, 0, 12);
    pop();
  }
}

function drawHeader() {
  // Small event label
  noStroke();
  fill("#25345D");
  rect(291, 28, 120, 30, 15);

  fill("#BFD0FF");
  textSize(12);
  textStyle(BOLD);
  text("SMÍDUM ÁGÆTI", 350, 43);

  // Main title
  fill("#FFFFFF");
  textSize(80);
  textStyle(BOLD);
  text("FIGHT MONTH", 350, 104);

  // Accent line
  noStroke();
  fill("#FF77A8");
  rect(300, 146, 100, 4, 2);
}

function drawJar() {
  let jarX = 220;
  let jarY = 205;
  let jarW = 260;
  let jarH = 360;
  let jarBottom = jarY + jarH;

  // Jar shadow
  noStroke();
  fill(0, 0, 0, 65);
  ellipse(350, jarBottom + 10, 285, 28);

  // Jar fill level
  let rawProgress = constrain(amountRaised / fundraisingGoal, 0, 1);
  let fillProgress = rawProgress * animationProgress;
  let fillHeight = (jarH - 35) * fillProgress;
  let fillY = jarBottom - fillHeight;

  // Colored liquid / donation fill
  noStroke();
  fill(178, 161, 105, 40);
  rect(jarX + 9, fillY, jarW - 18, fillHeight, 8);

  // Rounded-looking top of the fill using circles
  if (fillHeight > 4) {
    fill(188, 171, 115, 70);
    for (let x = jarX + 18; x < jarX + jarW - 18; x += 18) {
      let wave = sin(frameCount * 0.055 + x * 0.04) * 3;
      circle(x, fillY + wave, 12);
    }
  }

  // Floating coins inside jar
  for (let i = 0; i < 9; i++) {
    let coinX = jarX + 28 + ((i * 29) % (jarW - 55));
    let coinBaseY = jarBottom - 25 -
      ((i * 37) % max(40, fillHeight + 1));

    if (coinBaseY > fillY - 10 && fillHeight > 18) {
      let coinY = coinBaseY + sin(frameCount * 0.04 + i) * 4;
      fill("#FFD166");
      stroke(255, 238, 180);
      strokeWeight(1);
      circle(coinX, coinY, 13);
      noStroke();
      fill("#A76B25");
      textSize(9);
      text("$", coinX, coinY);
    }
  }

  // Glass body
  noFill();
  stroke(179, 207, 255, 200);
  strokeWeight(4);
  rect(jarX, jarY, jarW, jarH, 24);

  // Glass highlights
  stroke(255, 255, 255, 95);
  strokeWeight(5);
  line(jarX + 20, jarY + 35, jarX + 20, jarBottom - 35);
  stroke(255, 255, 255, 50);
  strokeWeight(2);
  line(jarX + jarW - 20, jarY + 50,
       jarX + jarW - 20, jarBottom - 55);

  // Jar lid
  noStroke();
  fill("#FF77A8");
  rect(jarX - 10, jarY - 12, jarW + 20, 30, 8);

  fill("#FFAAC7");
  rect(jarX + 3, jarY - 8, jarW - 6, 6, 3);

  // Jar label
  fill(11, 16, 36, 225);
  rect(jarX + 30, jarY + 110, jarW - 60, 100, 15);

  fill("#FFFFFF");
  textSize(18);
  textStyle(BOLD);
  text("VIKINGS FIGHT", 350, jarY + 139);
  text("CANCER", 350, jarY + 163);

  fill("#FFAAC7");
  textSize(12);
  textStyle(NORMAL);
  text("ONE DONATION AT A TIME", 350, jarY + 188);

  // Jar progress marker
  fill("#FFFFFF");
  textSize(13);
  textStyle(BOLD);
  text(round(rawProgress * 100) + "% FILLED", 350, jarBottom + 30);
}

function drawRaisedAmount() {
  let y = 625;

  fill("#9EABC9");
  textSize(14);
  textStyle(BOLD);
  text("TOTAL RAISED SO FAR", 350, y);

  fill("#FFFFFF");
  textSize(42);
  textStyle(BOLD);
  text(formatMoney(amountRaised), 350, y + 48);

  fill("#9EABC9");
  textSize(15);
  textStyle(NORMAL);
  text("of " + formatMoney(fundraisingGoal) + " goal", 350, y + 80);

  // Progress bar background
  noStroke();
  fill("#273252");
  rect(100, y + 105, 500, 13, 7);

  // Animated progress bar
  let progress = constrain(amountRaised / fundraisingGoal, 0, 1);
  let barW = 500 * progress * animationProgress;

  if (barW > 0) {
    fill("#FF77A8");
    rect(100, y + 105, barW, 13, 7);

    fill("#FFD166");
    circle(100 + barW, y + 111.5, 13);
  }

  fill("#C5CEE9");
  textSize(12);
  text("Donations go to a family in middleton struggling with cancer", 350, y + 132);
}

function drawGoals() {
  let startY = 805;
  let cardH = 68;
  let gap = 9;

  fill("#FFFFFF");
  textSize(20);
  textStyle(BOLD);
  text("OUR 4 GOALS", width/2, 780);

  for (let i = 0; i < goals.length; i++) {
    let g = goals[i];
    let y = startY + i * (cardH + gap);
    let reached = amountRaised >= g.amount;
    let cardW = 560;
    let x = 70;

    // Card background
    noStroke();
    fill(reached ? "#1C3550" : "#151D38");
    rect(x, y, cardW, cardH, 13);

    // Accent stripe
    fill(g.color);
    rect(x, y + 10, 4, cardH - 20, 2);

    // Icon circle
    fill(255, 255, 255, 15);
    circle(x + 37, y + cardH / 2, 43);

    fill(g.color);
    textSize(21);
    text(g.icon, x + 37, y + cardH / 2 + 1);

    // Goal title and description
    textAlign(LEFT, CENTER);
    fill("#FFFFFF");
    textStyle(BOLD);
    textSize(15);
    text(g.title, x + 70, y + 21);

    fill("#B7C3DF");
    textStyle(NORMAL);
    textSize(10.5);
    text(g.description, x + 70, y + 43, 365, 25);

    // Target amount
    textAlign(RIGHT, CENTER);
    fill(g.color);
    textStyle(BOLD);
    textSize(14);
    text(formatMoney(g.amount), x + cardW - 15, y + 23);

    // Status label
    fill(reached ? "#8FE0BF" : "#9EABC9");
    textSize(10);
    text(reached ? "REACHED ✓" : "TARGET", x + cardW - 15, y + 46);

    textAlign(CENTER, CENTER);
  }
}

function drawFooter() {
  fill("#8491B3");
  textSize(12);
  textStyle(NORMAL);
  text("THANK YOU FOR BEING PART OF FIGHT MONTH", 350, 1138);
}

function formatMoney(amount) {
  return "$" + amount.toLocaleString("en-US");
}

function windowResized() {
  let w = min(windowWidth, 700);
  resizeCanvas(w, w * canvasHeight / canvasWidth);
}
