import * as d3 from 'd3';

export function drawAFPChart(chartId, values) {
    let color = "steelblue";
    let formatCount = d3.format(",.0f");
    let margin = {top: 20, right: 30, bottom: 50, left: 40},
        width = window.innerWidth / 3 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    let max = d3.max(values) + 1;
    let min = d3.min(values);
    let x = d3.scaleLinear()
        .domain([min, max])
        .range([0, width]);


    let data = d3.histogram()
        .thresholds(x.ticks(20))
        (values);
    let yMax = d3.max(data, function(d){return d.length});
    let yMin = d3.min(data, function(d){return d.length});
    let colorScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);
    let y = d3.scaleLinear()
        .domain([0, yMax])
        .range([height, 0]);
    let xAxis = d3.axisBottom(x);
    let svg = d3.select("#" + chartId)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    let bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });
    bar.append("rect")
        .attr("x", 1)
        .attr("width", (x(data[0].x1 - data[0].x0) - x(0)) - 1)
        .attr("height", function(d) { return height - y(d.length); })
        .attr("fill", function(d) { return colorScale(d.length) });
    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", -15)
        .attr("x", (x(data[0].x1 - data[0].x0) - x(0)) / 2)
        .attr("text-anchor", "middle")
        .text(function(d) { if (d.length > 0) { return formatCount(d.length) } else {return ""}});
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("# of papers");
    svg.append("text")
        .attr("transform",
            "translate(" + (width/2) + " ," +
            (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("# of entities");
}

export function drawAFPPie(pieId, counts, labels, linkedListsKeys, title, extraUrlArgs) {
    let svg = d3.select("#" + pieId ),
        width = window.innerWidth / 4,
        height = width * 0.9,
        radius = Math.min(width, height) / 2 - 20,
        g = svg.append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    svg.attr("width", width)
        .attr("height", height);

    let color = d3.scaleOrdinal(d3.schemeAccent);

    // Generate the pie
    let pie = d3.pie();
    let arc = d3.arc()
        .outerRadius(radius - 20)
        .innerRadius(width / 5);
    //Generate groups
    let arcs = g.selectAll("arc")
        .data(pie(counts))
        .enter()
        .append("g")
        .attr("class", "arc");
    //Draw arc paths
    arcs.append("path")
        .attr("stroke", "gray")
        .attr("fill", function(d, i) {
            return color(i);
        })
        .attr("d", arc);

    arcs.append("text")
        .attr("transform", d => "translate(" + arc.centroid(d) + ")")
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function(d, i) { return labels[i] });

    svg.append("g")
        .attr("transform", "translate(" + (width / 2 - title.length * 3.5) + "," + 20 + ")")
        .append("text")
        .text(title)
        .attr("class", "title")
}