let symbolSize = 16;
let streams = [];
let brightnessThreshold = 75;

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide();

  for (let x = 0; x < width / (symbolSize * 0.6); x++) {
    const stream = new Stream(x * symbolSize * 0.6);
    streams.push(stream);
  }

  textSize(symbolSize);
}

function draw() {
  background(0, 150);

  // Draw the video capture scaled to the canvas size
  image(video, 0, 0, width, height);

  video.loadPixels();

  streams.forEach(stream => {
    stream.render();
  });
}

function getBrightness(x, y) {
  const index = (floor(x) + floor(y) * video.width) * 4;
  const r = video.pixels[index];
  const g = video.pixels[index + 1];
  const b = video.pixels[index + 2];
  return (r + g + b) / 3;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  streams = [];
  for (let x = 0; x < width / (symbolSize * 0.6); x++) {
    const stream = new Stream(x * symbolSize * 0.6);
    streams.push(stream);
  }
}

class MatrixSymbol {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.value;
    this.speed = speed;
    this.switchInterval = round(random(2, 20));
  }

  setRandomValue() {
    if (frameCount % this.switchInterval === 0) {
      this.value = String.fromCharCode(
        0x30A0 + round(random(0, 96))
      );
    }
  }

  rain() {
    this.y = (this.y >= height) ? -round(random(symbolSize, symbolSize * 10)) : this.y + this.speed;
  }
}

class Stream {
  constructor(x) {
    this.symbols = [];
    this.totalSymbols = round(random(5, 30));
    this.speed = round(random(2, 5));
    this.x = x;

    for (let i = 0; i < this.totalSymbols; i++) {
      const randomYOffset = -round(random(0, this.totalSymbols)) * symbolSize;
      const symbol = new MatrixSymbol(this.x, i * symbolSize + randomYOffset, this.speed);
      this.symbols.push(symbol);
    }
  }

  render() {
    this.symbols.forEach(symbol => {
      const brightness = getBrightness(symbol.x, symbol.y);
      if (brightness > brightnessThreshold) {
        fill(255, 20, 147); // Hit detected, change text color to pink
      } else {
        fill(128, 0, 128); // No hit, change text color to purple
      }
      text(symbol.value, symbol.x, symbol.y);
      symbol.rain();
      symbol.setRandomValue();
    });
  }
}

