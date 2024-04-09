// Create the SVG container for the chart
const svg = d3
    .select('#white-hat')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr(
        'transform',
        'translate(' + margin.left + ',' + margin.top + ')',
    );

// Load and process the data
d3.csv(
    'https://gist.githubusercontent.com/ncavestany/769d139f878f25ca7d9c71072078b75a/raw/bfb5ae1086ffb7cce41e23c5fa0f82a3d308debd/opioids.csv',
).then((data) => {
    data.forEach((d) => {
        d.Opioid_Deaths = +d['Number.Opioid.Any'];
        d.Year = +d['Year'];
        d.Prescription_Deaths = +d['Number.Opioid.Prescription'];
    });

    // Set the x and y scales
    const x = d3
        .scaleBand()
        .range([0, width])
        .domain(data.map((d) => d.Year))
        .padding(0.5);

    const y = d3
        .scaleLinear()
        .range([height, 0])
        .domain([
            0,
            d3.max(data, function (d) {
                return d.Opioid_Deaths;
            }),
        ]);

    // Create the x and y axes
    const xAxis = d3
        .axisBottom(x)
        .ticks(20)
        .tickSize(0)
        .tickFormat((d) => d.toString().replace(/\,/g, '')); // Remove commas

    const yAxis = d3.axisLeft(y).ticks(10);



    svg
        .append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    svg.append('text')
        .attr('class', 'y axis-title')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', (-margin.left / 2) - 20)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Total Deaths');

    const thresholdScale = d3
        .scaleThreshold(d3.interpolateReds)
        .domain([
            5000, 10000, 15000, 20000
        ])
        .range(
            d3.range(5).map(function (i) {
                return d3.interpolateReds(i / 4);
            })
        );

    svg
        .append('g')
        .attr('class', 'legendSequential')
        .attr('transform', 'translate(100,-10)');

    const legendSequential = d3
        .legendColor()
        .labelFormat(d3.format('.0f'))
        .labels(d3.legendHelpers.thresholdLabels)
        .title("Prescription Related Deaths")
        .scale(thresholdScale);

    svg.select('.legendSequential').call(legendSequential);

    var colorScale = d3
        .scaleSequential(d3.interpolateReds)
        .domain([
            0,
            d3.max(data, function (d) {
                return d.Prescription_Deaths;
            }),
        ]);


    svg
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
        .attr('width', x.bandwidth())
        .attr('height', function (d) {
            return height - y(d.Opioid_Deaths);
        })
        .style('fill', function (d) {
            return colorScale(d.Prescription_Deaths);
        })
        .append('title')
        .text((d) => 'Prescription deaths: ' + d['Number.Opioid.Prescription'] + '\n' + 'Total opioid-related deaths: ' + d['Number.Opioid.Any']);

    svg
        .append('g')
        .attr('class', 'x axis')
        .style('font-size', '10px')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);
    // chart title
    svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '25px')
        .text('Total Drug Related Deaths in America from 1999 to 2019');

    svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2 + 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .text('Collected by the National Institute on Drug Abuse');
});
