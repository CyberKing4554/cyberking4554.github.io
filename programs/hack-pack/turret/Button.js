class Button {
  constructor(
    mode,
    rectangleMode,
    x,
    y,
    buttonWidth,
    buttonHeight,
    buttonControlKey
  ) {
    if (
      mode == "textNoBorder" ||
      mode == "textWithBorder" ||
      mode == "arrowWithBorder" ||
      mode == "arrowNoBorder" ||
      mode == "image"
    ) {
      this.mode = mode;
    }
    this.rectangleMode = rectangleMode;
    this.x = x;
    this.y = y;
    this.buttonWidth = buttonWidth;
    this.buttonHeight = buttonHeight;
    this.buttonControlKey = buttonControlKey;
  }
  textInit(buttonText) {
    this.buttonText = buttonText;
  }
  arrowInit(arrowDirection) {
    this.arrowDirection = arrowDirection;
  }
  imageInit(buttonImage) {
    this.buttonImage = buttonImage;
  }
  trigger() {
    if (this.buttonPressed == true) {
      return true;
    } else {
      return false;
    }
  }

  tick() {
    if (this.mode != undefined) {
      if (this.mode == "textWithBorder") {
        this.drawBorder();
        this.drawText();
      } else if (this.mode == "textNoBorder") {
        this.drawText();
      } else if (this.mode == "arrowWithBorder") {
        this.drawBorder();
        this.drawArrow();
      } else if (this.mode == "arrowNoBorder") {
        this.drawArrow();
      } else if (this.mode == "image") {
      }
    }
  }

  buttonClicked() {
    let result;
    if (mouseIsPressed) {
      if (this.rectangleMode == CENTER) {
        if (
          mouseX > this.x - this.buttonWidth / 2 &&
          mouseX < this.x + this.buttonWidth / 2 &&
          mouseY > this.y - this.buttonHeight / 2 &&
          mouseY < this.y + this.buttonHeight / 2
        ) {
          result = true;
          return result;
        }
      } else if (this.rectangleMode == CORNER) {
        if (
          mouseX > this.x &&
          mouseX < this.x + this.buttonWidth &&
          mouseY > this.y &&
          mouseY < this.y + this.buttonHeight
        ) {
          result = true;
          return result;
        }
      }
    }
  }

  //--------------------------------------------------------------//Text
  textSettings(
    doStroke,
    strokeColor,
    textStrokeWeight,
    textFillColor,
    font,
    fontSize,
    marginOfError
  ) {
    this.doTextStroke = doStroke;
    this.textStrokeColor = strokeColor;
    this.textStrokeWeight = textStrokeWeight;
    this.textFillColor = textFillColor;
    this.font = font;
    this.fontSize = fontSize;
    this.marginOfError = marginOfError;
  }

  drawText() {
    if (this.doTextStroke == true) {
      stroke(this.textStrokeColor);
      strokeWeight(this.textStrokeWeight);
    } else {
      noStroke();
    }
    textSize(this.fontSize);
    fill(this.textFillColor);
    rectMode(this.rectangleMode);
    textAlign(CENTER);
    textFont(this.font);
    text(
      this.buttonText,
      this.x,
      this.y + this.marginOfError,
      this.buttonWidth,
      this.buttonHeight
    );
  }
  //------------------------BORDER-----------------------------//
  borderSettings(
    doStroke,
    strokeColor,
    borderStrokeWeight,
    borderFillColor,
    doRoundedCorners,
    cornerRadius
  ) {
    this.doBorderStroke = doStroke;
    this.borderStrokeColor = strokeColor;
    this.borderStrokeWeight = borderStrokeWeight;
    this.borderFillColor = borderFillColor;
    this.doRoundedCorners = doRoundedCorners;
    this.cornerRadius = cornerRadius;
  }

  drawBorder() {
    if (this.doBorderStroke) {
      stroke(this.borderStrokeColor);
      strokeWeight(this.borderStrokeWeight);
    } else noStroke();
    fill(this.borderFillColor);
    rectMode(this.rectangleMode);
    if (this.doRoundedCorners) {
      rect(
        this.x,
        this.y,
        this.buttonWidth,
        this.buttonHeight,
        this.cornerRadius,
        this.cornerRadius,
        this.cornerRadius,
        this.cornerRadius
      );
    } else {
      rect(this.x, this.y, this.buttonWidth, this.buttonHeight);
    }
  }
  //-------------------------------------------ARROW---------------------------------------------------------------------//
  arrowSettings(
    arrowDirection,
    arrowType,
    arrowColor,
    doArrowStroke,
    arrowStrokeWeight,
    arrowStrokeColor,
    arrowMargineOfError
  ) {
    this.arrowType = arrowType;
    this.arrowDirection = arrowDirection;
    this.arrowColor = arrowColor;
    this.doArrowStroke = doArrowStroke;
    this.arrowStrokeWeight = arrowStrokeWeight;
    this.arrowStrokeColor = arrowStrokeColor;
    this.arrowMargineOfError = arrowMargineOfError;
  }

  drawArrow() {
    if (this.arrowType == "standardWithBar") {
      this.drawStandardArrow();
    } else if (this.arrowType == "standardWithoutBar") {
      this.drawStandardArrow();
    } else if (this.arrowType == "advanced") {
    }
  }

  drawStandardArrow() {
    push();
    angleMode(DEGREES);
    if (this.doArrowStroke) {
      strokeWeight(this.arrowStrokeWeight);
      stroke(this.arrowStrokeColor);
    } else {
      noStroke();
    }
    fill(this.arrowColor);

    if (this.arrowType == "standardWithBar") {
    } else {
      if (this.rectangleMode == CORNER) {
        translate(
          this.x + this.buttonWidth / 2,
          this.y + this.buttonHeight / 2
        );
        rotate(this.arrowDirection);

        triangle(
          0 + this.buttonWidth / 2 - this.buttonWidth / 2,
          this.arrowMargineOfError - this.buttonHeight / 2,
          this.arrowMargineOfError - this.buttonWidth / 2,
          0 +
            this.buttonHeight -
            this.arrowMargineOfError -
            this.buttonHeight / 2,
          0 +
            this.buttonWidth -
            this.arrowMargineOfError -
            this.buttonWidth / 2,
          0 +
            this.buttonHeight -
            this.arrowMargineOfError -
            this.buttonHeight / 2
        );
      } else if (this.rectangleMode == CENTER) {
        translate(this.x, this.y);
        rotate(this.arrowDirection);

        triangle(
          0,
          0 - this.buttonHeight / 2 + this.arrowMargineOfError,
          0 - this.buttonWidth / 2 + this.arrowMargineOfError,
          0 + this.buttonHeight / 2 - this.arrowMargineOfError,
          0 + this.buttonWidth / 2 - this.arrowMargineOfError,
          0 + this.buttonHeight / 2 - this.arrowMargineOfError
        );
      }
    }
    pop();
  }

  //---------------------------IMAGE-----------------------//
  selectImage(buttonImage) {
    this.buttonImage = buttonImage;
  }
  drawImage() {
    imageMode(this.rectangleMode);
    if (this.rectangleMode == CENTER){
      image(this.x,this.y,this.buttonWidth,this.buttonHeight);
    } else {
      image(this.x,this.y,this.buttonWidth,this.buttonHeight);
    }
  }
}
