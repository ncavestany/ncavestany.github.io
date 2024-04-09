    // Set up the dimensions/margins of the chart
    const margin = {
        top: 100, right: 100, bottom: 100, left: 100
    }
    const width = window.innerWidth - margin.left - margin.right;
    const height = window.innerHeight - margin.top - margin.bottom;

    // Create the SVG container for the chart
    const svg = d3.select("#new-heatmap").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Load and process the data
    d3.csv("https://gist.githubusercontent.com/ncavestany/8dface70f6bc9e576c6847bb7ca09dc3/raw/0eb71995bd62624f33ca8c15695cdd5349d2a510/state_crime.csv").then(data => {
        data.forEach(d => {
            d.Violent_Crime_Rate = +d["Data.Rates.Violent.All"];
            d.Year = +d["Year"];
        });

        var statesArray = data.map((d) => d.State);
        statesArray.reverse(); // For some reason the states ended up reversed in the y-axis
        var yearArray = data.map((d) => d.Year);

        // Set the x and y scales
        const x = d3
            .scaleBand()
            .range([0, width])
            .domain(yearArray)
            .padding(0.05);
        ;

        const y = d3.scaleBand()
            .range([height, 0])
            .domain(statesArray)
            .padding(0.05);
        ;

        // Create the x and y axes
        const xAxis = d3
            .axisBottom(x)
            .tickFormat((d) => d.toString().replace(/\,/g, '')); // Remove commas

        const yAxis = d3.axisLeft(y)
            .ticks(10)
            .tickSize(0);

        svg
            .append('g')
            .attr('class', 'x axis')
            .style('font-size', '10px')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        const thresholdScale = d3
            .scaleThreshold(d3.interpolateReds)
            .domain([200, 400, 600, 800])
            .range(
                d3.range(5).map(function (i) {
                    return d3.interpolateReds(i / 5);
                }),
            );

        svg
            .append('g')
            .attr('class', 'legendSequential')
            .attr('transform', 'translate(900,-60)');

        const legendSequential = d3
            .legendColor()
            .shapeWidth(80)
            .orient("horizontal")
            .labelFormat(d3.format('.0f'))
            .labels(d3.legendHelpers.thresholdLabels)
            .scale(thresholdScale)
            .title("Crime Rate Per 100k People");

        svg.select('.legendSequential').call(legendSequential);

        var colorScale = d3
            .scaleSequential(d3.interpolateReds)
            .domain([
                0,
                d3.max(data, function (d) {
                    return d.Violent_Crime_Rate;
                }),
            ]);

        svg.selectAll()
            .data(data, function (d) { return d.Year + ':' + d.State; })
            .join("rect")
            .attr("x", function (d) { return x(d.Year) })
            .attr("y", function (d) { return y(d.State) })
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function (d) { return colorScale(d.Violent_Crime_Rate) })
            .append('title')
            .text(
            (d) =>
                'Rate of violent crimes per 100k people: ' +
                d['Violent_Crime_Rate'] +
                '\nState: ' +
                d['State'],
            );;

        // chart title
        svg.append('text')
            .attr('x', width / 2)
            .attr('y', -margin.top / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '25px')
            .text('Violent Crime Rates from 2000 to 2019');
        
            svg.append('text')
            .attr('x', width / 2)
            .attr('y', -margin.top / 2 + 30)
            .attr('text-anchor', 'middle')
            .style('font-size', '18px')
            .text('From the Unified Crime Reporting Statistics');

        // x-axis title
        svg
            .append('text')
            .attr('class', 'x-axis-title')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', height + 40)
            .text('Year')
            .style('font-size', '12px');

        // y-axis title
        svg
            .append('text')
            .attr('class', 'y-axis-title')
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -60)
            .text('State')
            .style('font-size', '12px');
    });