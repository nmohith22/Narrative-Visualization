function drawFirstChart() {
    clearCharts();
    drawLegend();

    let churnTotal = 0;
    for (let i = 0; i < myData.length; i++) {
        churnTotal += myData[i].churned_by_february;
    }
    let churnPercent = (churnTotal / myData.length) * 100;
    let stayPercent = 100 - churnPercent;
    let stayCount = myData.length - churnTotal;

    let chartData = [
        { name: "Stayed (Active)", val: stayPercent, c: "green", cls: "stayed-data", count: stayCount },
        { name: "Churned", val: churnPercent, c: "red", cls: "churned-data", count: churnTotal }
    ];

    let x = d3.scaleBand().domain(["Stayed (Active)", "Churned"]).range([w/4, 3*w/4]).padding(0.4);
    let y = d3.scaleLinear().domain([0, 100]).range([h, 0]);

    addGridlines(y);
    xAxisGroup.call(d3.axisBottom(x));
    yAxisGroup.call(d3.axisLeft(y).tickFormat(d => d + "%"));
    yLabel.text("Percentage (%)");

    let bars = svg.selectAll(".cat-group").data(chartData);
    
    // source: https://observablehq.com/@d3/learn-d3-joins
    bars.enter().append("rect")
        .attr("class", function(d) { return "cat-group " + d.cls; })
        .attr("x", function(d) { return x(d.name); })
        .attr("y", h)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", function(d) { return d.c; })
        
        // source: https://d3-graph-gallery.com/graph/interactivity_tooltip.html
        .on("mouseover", function(event, d) {
            tooltip.classed("hidden", false);
            tooltip.html("<h3>" + d.name + "</h3><p>" + d.val.toFixed(1) + "% &bull; " + d.count.toLocaleString() + " members</p>");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 15) + "px");
            tooltip.style("top", (event.pageY - 15) + "px");
        })
        .on("mouseout", function() {
            tooltip.classed("hidden", true);
        })
        
        .merge(bars)
        .transition().duration(700)
        .attr("x", function(d) { return x(d.name); })
        .attr("y", function(d) { return y(d.val); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return h - y(d.val); });

    // Add value labels and annotation after bars finish animating
    setTimeout(function() {
        if (currentScene !== 1) return;

        // Value labels above bars
        chartData.forEach(function(d) {
            svg.append("text")
                .attr("class", "value-label cat-group " + d.cls)
                .attr("x", x(d.name) + x.bandwidth() / 2)
                .attr("y", y(d.val) - 8)
                .attr("text-anchor", "middle")
                .text(d.val.toFixed(1) + "%")
                .style("font-size", "14px")
                .style("font-weight", "bold")
                .style("fill", "#333")
                .style("opacity", 0)
                .transition().duration(300)
                .style("opacity", 1);
        });
        
        // Static annotation on Churned bar using d3-annotation
        let annotations = [{
            note: {
                label: "Roughly 1 in every 2 January signups will stop showing up within two months — " + churnTotal.toLocaleString() + " members lost",
                title: "The Resolution Effect",
                wrap: 150
            },
            connector: { end: "arrow" },
            x: x("Churned") + x.bandwidth() / 2,
            y: y(churnPercent),
            dx: 80,
            dy: -60
        }];
        
        let makeAnnotations = d3.annotation()
            .type(d3.annotationCalloutElbow)
            .annotations(annotations);
        
        svg.append("g")
            .attr("class", "annotation-group cat-group")
            .call(makeAnnotations)
            .style("opacity", 0)
            .transition().duration(500)
            .style("opacity", 1);
    }, 750);
}
