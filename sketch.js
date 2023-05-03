let symbolSize = 16;
let streams = [];
let brightnessThreshold = 75;
let video;
let cameraButton;
let currentCamera = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide();

  for (let x = 0; x < width / (symbolSize * 0.6); x++) {
    const stream = new Stream(x * symbolSize * 0.6);
    streams.push(stream);
  }

  textSize(symbolSize);
  // Create the camera switch button
  cameraButton = createButton('Switch Camera');
  cameraButton.position(20, 20);
  cameraButton.mousePressed(switchCamera);
}
async function switchCamera() {
  // Stop the current camera stream
  video.stop();

  // Get the available devices
  const devices = await navigator.mediaDevices.enumerateDevices();

  // Filter the video input devices
  const videoDevices = devices.filter(device => device.kind === 'videoinput');

  // Switch to the next camera
  currentCamera = (currentCamera + 1) % videoDevices.length;
  const cameraId = videoDevices[currentCamera].deviceId;

  // Create a new video capture with the selected camera
  const constraints = {
    video: {
      deviceId: cameraId,
    },
  };

  video = createCapture(constraints);
  video.hide();
}

function draw() {
  background(0);

  video.loadPixels();

  streams.forEach(stream => {
    stream.render();
  });
}

function getBrightness(x, y) {
  const scaleFactorWidth = video.width / width;
  const scaleFactorHeight = video.height / height;

  const scaledX = floor(x * scaleFactorWidth);
  const scaledY = floor(y * scaleFactorHeight);

  const index = (scaledX + scaledY * video.width) * 4;
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
    this.totalSymbols = round(random(15, 50));
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
        fill(50, 50, 100); // Hit detected, change text color to pink
      } else {
        fill(150, 50, 100); // No hit, change text color to purple
      }
      text(symbol.value, symbol.x, symbol.y);
      symbol.rain();
      symbol.setRandomValue();
    });
  }
}
