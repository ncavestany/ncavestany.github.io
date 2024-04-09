// Set up the dimensions/margins of the chart
const margin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100,
};
const width =
    window.innerWidth - margin.left - margin.right;
const height =
    window.innerHeight - margin.top - margin.bottom;


// Create the SVG container for the chart
const blackHatsvg = d3
    .select('#black-hat')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr(
        'transform',
        'translate(' + margin.left + ',' + (margin.top) + ')',
    );

// Create an array of random colors. 
// count is the length of the array/the amount of colors
function generateRandomColors(count) {
    const randomColors = [];
    const letters = '0123456789ABCDEF';

    for (let i = 0; i < count; i++) {
        let color = '#';
        for (let j = 0; j < 6; j++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        randomColors.push(color);
    }

    return randomColors;
}

// Fisher-Yates Shuffle from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
    let currentIndex = array.length;
  
    while (currentIndex != 0) {
  
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

// Load and process the data
d3.csv(
    'https://gist.githubusercontent.com/ncavestany/769d139f878f25ca7d9c71072078b75a/raw/bfb5ae1086ffb7cce41e23c5fa0f82a3d308debd/opioids.csv',
).then((data) => {
    data.forEach((d) => {
        d.Opioid_Deaths = +d['Number.Opioid.Any'];
        d.Year = +d['Year'];
        d.Prescription_Deaths = +d['Number.Opioid.Prescription'];
    });

    var yearsArray = data.map((d) => d.Year);
    var ruinedYearsArray = shuffle(yearsArray);

    // Set the x and y scales
    const x = d3
        .scaleBand()
        .range([0, width])
        .domain(ruinedYearsArray);

    const y = d3
        .scaleLinear()
        .range([height, 0])
        .domain([
            3500,
            50000,
        ]);

    // Create the x and y axes
    const xAxis = d3
        .axisBottom(x)
        .ticks(20)
        .tickSize(0)
        .tickFormat((d) => d.toString().replace(/\,/g, '')); // Remove commas

    const yAxis = d3.axisLeft(y).ticks(20).tickSize(0);

    blackHatsvg
        .append('g')
        .attr('class', 'x axis')
        .style('font-size', '25px')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    blackHatsvg.append('g').attr('class', 'y axis').call(yAxis);

    var randomColors = generateRandomColors(yearsArray.length);

    var colorScale = d3
        .scaleOrdinal()
        .domain(ruinedYearsArray)
        .range(randomColors);



    blackHatsvg
        .selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', function (d) {
            return x(d.Year);
        })
        .attr('y', function (d) {
            return y(d.Opioid_Deaths);
        })
        .attr('width', 100)
        .attr('height', function (d) {
            return height - y(d.Opioid_Deaths);
        })
        .style('fill', function (d) {
            return colorScale(d.Year);
        })
        .append('title')
        .text((d) => d['Number.Opioid.Prescription']);
    
    var sequentialScale = d3
        .scaleOrdinal()
        .domain(ruinedYearsArray)
        .range(randomColors);

    blackHatsvg
        .append('g')
        .attr('class', 'legendOrdinal')
        .attr('transform', 'translate(1200,0)');

    var legendOrdinal = d3
        .legendColor()
        .shapeWidth(30)
        .cells(10)
        .orient('vertical')
        .scale(sequentialScale);
    blackHatsvg.select('.legendOrdinal').call(legendOrdinal);

    // chart title
    blackHatsvg
        .append('text')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '25px')
        .text('The DEADLINESS Of Prescription Drugs');
});
