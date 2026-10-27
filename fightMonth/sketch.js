
/*
  FIGHT MONTH — Responsive Cancer Fundraiser
  p5.js 2.3.4

  Responsive for phones, tablets, laptops, and desktops.
*/

// ===== FUNDRAISING SETTINGS =====
let amountRaised = 0;
let fundraisingGoal = 5000;

let goals = [
  {
    amount: 1800,
    icon: "🎀",
    title: "Temporary Dye",
    description: "Student volunteers temporarily dye their hair.",
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
    description: "Student volunteers buzz and dye their hair.",
    color: "#FFFFFF"
  },
  {
    amount: 5000,
    icon: "🎗",
    title: "Staff Buzz/Dye",
    description: "Staff volunteers buzz and/or dye their hair.",
    color: "#FFD166"
  }
];

// ===== DESIGN SETTINGS =====
const MAX_WIDTH = 900;
const MIN_WIDTH = 280;

let particles = [];
let moneyPieces = [];
let animationProgress = 0;
let fightMonthCanvas;

// ===== SETUP =====
function setup() {
  pixelDensity(min(window.devicePixelRatio || 1, 2));

  textFont("sans-serif");
  textAlign(CENTER, CENTER);

  createResponsiveCanvas();
  initializeParticles();
  initializeMoney();
}

// ===== RESPONSIVE CANVAS =====
function createResponsiveCanvas() {
  let w = constrain(windowWidth, MIN_WIDTH, MAX_WIDTH);
  let h = calculateHeight(w);

  if (!fightMonthCanvas) {
    // Create the canvas and retain its reference.
    fightMonthCanvas = createCanvas(w, h);

    fightMonthCanvas.elt.style.display = "block";
    fightMonthCanvas.elt.style.maxWidth = "100%";
    fightMonthCanvas.elt.style.height = "auto";
    fightMonthCanvas.elt.style.margin = "0 auto";
  } else {
    // resizeCanvas returns no canvas element.
    resizeCanvas(w, h);
  }
}

// ===== RESPONSIVE LAYOUT =====
function calculateHeight(w) {
  return getLayout(w).totalHeight;
}

function getLayout(w = width) {
  let pad = max(16, w * 0.055);

  let jarW = min(260, max(175, w * 0.40));
  let jarH = jarW * 1.38;
  let jarX = (w - jarW) / 2;
  let jarY = 176;
  let jarBottom = jarY + jarH;

  let metricY = jarBottom + 80;
  let barX = pad + 15;
  let barW = max(30, w - barX * 2);

  let goalsTitleY = metricY + 180;
  let cardStartY = goalsTitleY + 30;

  let cardH = w < 430 ? 104 : 86;
  let gap = 10;

  let footerY =
    cardStartY + goals.length * (cardH + gap) - gap + 40;

  return {
    w,
    pad,
    jarW,
    jarH,
    jarX,
    jarY,
    jarBottom,
    metricY,
    barX,
    barW,
    goalsTitleY,
    cardStartY,
    cardH,
    gap,
    footerY,
    totalHeight: footerY + 35
  };
}

// ===== INITIALIZE PARTICLES =====
function initializeParticles() {
  particles = [];

  for (let i = 0; i < 35; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      size: random(2, 5),
      speed: random(0.3, 1.1),
      phase: random(TWO_PI)
    });
  }
}

function initializeMoney() {
  moneyPieces = [];

  for (let i = 0; i < 16; i++) {
    moneyPieces.push({
      x: random(20, max(21, width - 20)),
      y: random(180, 600),
      speed: random(0.003, 0.012),
      size: random(0.7, 1.15),
      phase: random(TWO_PI)
    });
  }
}

// ===== MAIN DRAW LOOP =====
function draw() {
  animationProgress = min(animationProgress + 0.025, 1);

  let layout = getLayout();

  // Keep the canvas height synchronized with the layout.
  if (height !== layout.totalHeight) {
    resizeCanvas(width, layout.totalHeight);
  }

  drawBackground();
  drawDecorations();
  drawHeader();
  drawJar(layout);
  drawRaisedAmount(layout);
  drawGoals(layout);
  drawFooter(layout);
}

// ===== BACKGROUND =====
function drawBackground() {
  background("#0A2140");

  noStroke();

  let positions = [
    [0.10, 0.19],
    [0.88, 0.30],
    [0.82, 0.65],
    [0.12, 0.79],
    [0.50, 0.91]
  ];

  for (let i = 0; i < positions.length; i++) {
    let x = positions[i][0] * width;
    let y = positions[i][1] * height;
    let d = min(140, width * 0.24) +
      sin(frameCount * 0.02 + i) * 12;

    fill(75, 92, 180, 15);
    circle(x, y, d);
  }

  for (let p of particles) {
    let twinkle =
      0.3 + abs(sin(frameCount * 0.025 + p.phase)) * 0.7;

    fill(210, 225, 255, 100 * twinkle);
    circle(p.x, p.y, p.size);

    p.y -= p.speed;

    if (p.y < -5) {
      p.y = height + 5;
      p.x = random(width);
    }

    if (p.x > width) {
      p.x = random(width);
    }
  }
}

// ===== FLOATING MONEY =====
function drawDecorations() {
  for (let m of moneyPieces) {
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

// ===== HEADER =====
function drawHeader() {
  let cx = width / 2;

  noStroke();
  fill("#25345D");
  rect(cx - 64, 27, 128, 30, 15);

  fill("#BFD0FF");
  textStyle(BOLD);
  textSize(11);
  text("VIKINGS • COMMUNITY", cx, 42);

  fill("#FFFFFF");

  let titleSize = min(80, width * 0.105);
  textSize(titleSize);
  textStyle(BOLD);
  text("FIGHT MONTH", cx, 101);

  fill("#FF77A8");
  rect(cx - 50, 139, 100, 4, 2);

  fill("#C5CEE9");
  textStyle(NORMAL);
  textSize(min(14, width * 0.038));
  text("Together, we can make a difference.", cx, 158);
}

// ===== FUNDRAISING JAR =====
function drawJar(s) {
  let x = s.jarX;
  let y = s.jarY;
  let jarW = s.jarW;
  let jarH = s.jarH;
  let bottom = s.jarBottom;
  let cx = width / 2;

  // Jar shadow
  noStroke();
  fill(0, 0, 0, 65);
  ellipse(cx, bottom + 9, jarW + 25, 25);

  // Donation fill level
  let progress = constrain(amountRaised / fundraisingGoal, 0, 1);
  let fillHeight = (jarH - 35) * progress * animationProgress;
  let fillY = bottom - fillHeight;

  // CHANGE LIQUID COLOR HERE:
  // RGB values are followed by transparency (0-255).
  noStroke();
  fill(178, 161, 105, 145);
  rect(x + 8, fillY, jarW - 16, fillHeight, 8);

  // Animated liquid surface
  if (fillHeight > 4) {
    fill(220, 200, 140, 165);

    for (let px = x + 18; px < x + jarW - 18; px += 18) {
      let wave = sin(frameCount * 0.055 + px * 0.04) * 3;
      circle(px, fillY + wave, 12);
    }
  }

  // Floating coins
  for (let i = 0; i < 9; i++) {
    let coinX = x + 28 + ((i * 29) % (jarW - 55));

    let coinBaseY = bottom - 25 -
      ((i * 37) % max(40, fillHeight + 1));

    if (coinBaseY > fillY - 10 && fillHeight > 18) {
      let coinY = coinBaseY + sin(frameCount * 0.04 + i) * 4;

      fill("#FFD166");
      stroke(255, 238, 180);
      strokeWeight(1);
      circle(coinX, coinY, 13);

      noStroke();
      fill("#A76B25");
      textStyle(BOLD);
      textSize(9);
      text("$", coinX, coinY);
    }
  }

  // Glass body
  noFill();
  stroke(179, 207, 255, 210);
  strokeWeight(4);
  rect(x, y, jarW, jarH, 24);

  // Glass highlights
  stroke(255, 255, 255, 95);
  strokeWeight(5);
  line(x + 20, y + 35, x + 20, bottom - 35);

  stroke(255, 255, 255, 50);
  strokeWeight(2);
  line(
    x + jarW - 20,
    y + 50,
    x + jarW - 20,
    bottom - 55
  );

  // Lid
  noStroke();
  fill("#FF77A8");
  rect(x - 10, y - 12, jarW + 20, 30, 8);

  fill("#FFAAC7");
  rect(x + 3, y - 8, jarW - 6, 6, 3);

  // Jar label
  let labelW = jarW * 0.77;
  let labelH = 100;
  let labelX = cx - labelW / 2;
  let labelY = y + jarH * 0.32;

  fill(11, 16, 36, 225);
  rect(labelX, labelY, labelW, labelH, 15);

  fill("#FFFFFF");
  textStyle(BOLD);
  textSize(min(18, jarW * 0.075));
  text("VIKINGS FIGHT", cx, labelY + 29);
  text("CANCER", cx, labelY + 53);

  fill("#FFAAC7");
  textStyle(NORMAL);
  textSize(min(11, jarW * 0.045));
  text("ONE DONATION AT A TIME", cx, labelY + 77);

  // Percentage filled
  fill("#FFFFFF");
  textStyle(BOLD);
  textSize(13);
  text(round(progress * 100) + "% FILLED", cx, bottom + 29);
}

// ===== FUNDRAISING TOTAL =====
function drawRaisedAmount(s) {
  let y = s.metricY;
  let cx = width / 2;

  fill("#9EABC9");
  textSize(min(14, width * 0.04));
  textStyle(BOLD);
  text("TOTAL RAISED SO FAR", cx, y);

  fill("#FFFFFF");
  textSize(min(44, width * 0.12));
  textStyle(BOLD);
  text(formatMoney(amountRaised), cx, y + 43);

  fill("#9EABC9");
  textSize(15);
  textStyle(NORMAL);
  text("of " + formatMoney(fundraisingGoal) + " goal", cx, y + 77);

  // Progress bar background
  noStroke();
  fill("#273252");
  rect(s.barX, y + 100, s.barW, 13, 7);

  let progress = constrain(amountRaised / fundraisingGoal, 0, 1);
  let barW = s.barW * progress * animationProgress;

  if (barW > 0) {
    fill("#FF77A8");
    rect(s.barX, y + 100, barW, 13, 7);

    fill("#FFD166");
    circle(s.barX + barW, y + 106.5, 13);
  }


  // Donation text — centered directly beneath the progress bar
  fill("#C5CEE9");
  textStyle(NORMAL);
  textSize(min(12, width * 0.033));
  textAlign(CENTER, CENTER);

  text(
    "Every donation goes to a family in Middleton affected by cancer.",
    width / 2,
    y + 135
  );

}

// ===== GOAL CARDS =====
function drawGoals(s) {
  let cx = width / 2;

  fill("#FFFFFF");
  textStyle(BOLD);
  textSize(min(22, width * 0.06));
  text("OUR 4 GOALS", cx, s.goalsTitleY);

  for (let i = 0; i < goals.length; i++) {
    let g = goals[i];
    let x = s.pad;
    let y = s.cardStartY + i * (s.cardH + s.gap);
    let cardW = width - s.pad * 2;
    let cardH = s.cardH;
    let reached = amountRaised >= g.amount;

    // Card background
    noStroke();
    fill(reached ? "#1C3550" : "#151D38");
    rect(x, y, cardW, cardH, 13);

    // Accent stripe
    fill(g.color);
    rect(x, y + 12, 4, cardH - 24, 2);

    // Icon background
    fill(255, 255, 255, 15);
    circle(x + 36, y + cardH / 2, 42);

    fill(g.color);
    textStyle(NORMAL);
    textSize(21);
    text(g.icon, x + 36, y + cardH / 2 + 1);

    // Title and description
    let textX = x + 67;
    let rightEdge = x + cardW - 12;
    let textW = max(65, cardW - 165);

    textAlign(LEFT, CENTER);
    fill("#FFFFFF");
    textStyle(BOLD);
    textSize(min(15, max(12, width * 0.041)));

    text(
      g.title,
      textX,
      y + (cardH < 95 ? 23 : 25),
      textW,
      24
    );

    fill("#B7C3DF");
    textStyle(NORMAL);
    textSize(width < 360 ? 10 : 11);

    text(
      g.description,
      textX,
      y + (cardH < 95 ? 51 : 55),
      textW,
      cardH < 95 ? 27 : 36
    );

    // Target amount
    textAlign(RIGHT, CENTER);
    fill(g.color);
    textStyle(BOLD);
    textSize(min(14, max(11, width * 0.038)));
    text(formatMoney(g.amount), rightEdge, y + 24);

    // Goal status
    fill(reached ? "#8FE0BF" : "#9EABC9");
    textSize(10);
    text(reached ? "REACHED ✓" : "TARGET", rightEdge, y + 48);

    textAlign(CENTER, CENTER);
  }
}

// ===== FOOTER =====
function drawFooter(s) {
  fill("#8491B3");
  textStyle(NORMAL);
  textSize(min(12, width * 0.033));

  text(
    "",
    width / 2,
    s.footerY,
    width - s.pad * 2,
    25
  );
}

// ===== HELPER =====
function formatMoney(amount) {
  return "$" + amount.toLocaleString("en-US");
}

// ===== WINDOW RESIZE =====
function windowResized() {
  createResponsiveCanvas();

  // Keep particles inside the new canvas dimensions.
  for (let p of particles) {
    p.x = constrain(p.x, 0, width);
    p.y = constrain(p.y, 0, height);
  }

  // Keep floating money within the canvas.
  for (let m of moneyPieces) {
    m.x = constrain(m.x, 20, max(21, width - 20));
  }
}
