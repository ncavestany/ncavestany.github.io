let table;
let states = [];
let years = [];
let totalCrimes = [];
let sketchSVG;


function preload() {
  let url = 'https://gist.githubusercontent.com/ncavestany/8dface70f6bc9e576c6847bb7ca09dc3/raw/0eb71995bd62624f33ca8c15695cdd5349d2a510/state_crime.csv';
  table = loadTable(url, 'csv', 'header');
  noLoop();
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('sketch');
  sketchSVG = createGraphics(width, height);

}

function draw() {
  background(255);
  textAlign(CENTER);
  textSize(25);
  text('Violent Crime Rates from 2008-2019 by State', width / 2, 30);


  for (let i = 0; i < table.getRowCount(); i++) {
    let state = table.getString(i, 'State');
    let year = table.get(i, 'Year');
    let yearlyCrimes = table.get(i, 'Data.Rates.Violent.All');
    if (!states.includes(state)) {
      states.push(state);
    }
    if (!years.includes(year)) {
      years.push(year);
    }
    totalCrimes.push(yearlyCrimes);
  }

     // Draw legend
     noStroke();
     textSize(12);
     fill(0);
     text("Higher Crime Rates", width + 20, 100);
     for (let i = 0; i < 256; i += 5) {
       fill(255 - i, 50, 0); // Brighter shades of red for higher values
       rect(width, 120 + i / 2, 30, 5);
     }
     text("Lower Crime Rates", width + 20, 275);


  let margin = 50;
  let ySpacing = (height - 2 * margin) / states.length;

  textSize(12);
  for (let i = 0; i < years.length; i++) {
    text(years[i], (i * 70) + 400, height - 15);
  }

  stroke(0);
  line(300, height, 1200, height); // x-axis
  line(width - 900, 60, width - 900, height); // y-axis

  textAlign(LEFT, CENTER);
  // Print states on y-axis
  for (let i = 0; i < states.length; i++) {
    let x = margin - 10;
    let y = margin + i * ySpacing;
    text(states[i], x + 200, y + 50);
  }

  let totalCrimesIndex = 0;
  // Loop through the states and years to draw the heatmap
  for (let i = 0; i < states.length; i++) {
    for (let j = 0; j < years.length; j++) {
      let y = margin + i * ySpacing;
      fill(totalCrimes[totalCrimesIndex] / 2, 50, 0);
      totalCrimesIndex++;
      square((j * 70) + 375, y + 20, 55);
    }
  }

  image(sketchSVG, 0, 0);



}


