function underConstructionSign(){
  image(crane,width/2-100,255,200,200);
  image(construction,width/2-125,34,250,250);
  noStroke();
  fill(0);
  textAlign(CENTER);
  rectMode(CENTER);
  text("Sorry this page is under construction.",width/2,183,100);
  textSize(18);
  text("You can still check out our other pages.",width/2+100,100,150);

}

function drawArrow(base, vec, myColor) {
  push();
  stroke(myColor);
  strokeWeight(3);
  fill(myColor);
  translate(base.x, base.y);
  line(0, 0, vec.x, vec.y);
  rotate(vec.heading());
  let arrowSize = 7;
  translate(vec.mag() - arrowSize, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
}