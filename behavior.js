function drawLineChart() {
    clearCharts();
    drawLegend();

    // Compute average weekly visits for churned vs active
    let churnedWeeks = [0, 0, 0, 0];
    let activeWeeks = [0, 0, 0, 0];
    let churnedCount = 0;
    let activeCount = 0;

    for (let i = 0; i < myData.length; i++) {
        let d = myData[i];
        if (d.churned_by_february === 1) {
            churnedCount++;
            churnedWeeks[0] += d.week1_visits;
            churnedWeeks[1] += d.week2_visits;
            churnedWeeks[2] += d.week3_visits;
            churnedWeeks[3] += d.week4_visits;
        } else {
            activeCount++;
            activeWeeks[0] += d.week1_visits;
            activeWeeks[1] += d.week2_visits;
            activeWeeks[2] += d.week3_visits;
            activeWeeks[3] += d.week4_visits;
        }
    }

    let weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
    let lineData = [];
    for (let j = 0; j < 4; j++) {
        lineData.push({
            week: weekLabels[j],
            active: activeWeeks[j] / activeCount,
            churned: churnedWeeks[j] / churnedCount
        });
    }

    let x = d3.scalePoint().domain(weekLabels).range([0, w]).padding(0.3);
    let yMax = d3.max(lineData, function(d) { return Math.max(d.active, d.churned); });
    let y = d3.scaleLinear().domain([0, Math.ceil(yMax + 0.5)]).range([h, 0]);

    addGridlines(y);
    xAxisGroup.call(d3.axisBottom(x));
    yAxisGroup.call(d3.axisLeft(y));
    xLabel.text("Week of January");
    yLabel.text("Average Visits per Week");

    // Active line
    let activeLine = d3.line()
        .x(function(d) { return x(d.week); })
        .y(function(d) { return y(d.active); });

    let activePathEl = svg.append("path")
        .attr("class", "cat-group stayed-data")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 3)
        .attr("d", activeLine);

    // Animate active line drawing
    let activeTotalLength = activePathEl.node().getTotalLength();
    activePathEl
        .attr("stroke-dasharray", activeTotalLength + " " + activeTotalLength)
        .attr("stroke-dashoffset", activeTotalLength)
        .transition().duration(1000)
        .attr("stroke-dashoffset", 0);

    // Churned line
    let churnedLine = d3.line()
        .x(function(d) { return x(d.week); })
        .y(function(d) { return y(d.churned); });

    let churnedPathEl = svg.append("path")
        .attr("class", "cat-group churned-data")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 3)
        .attr("d", churnedLine);

    // Animate churned line drawing
    let churnedTotalLength = churnedPathEl.node().getTotalLength();
    churnedPathEl
        .attr("stroke-dasharray", churnedTotalLength + " " + churnedTotalLength)
        .attr("stroke-dashoffset", churnedTotalLength)
        .transition().duration(1000)
        .attr("stroke-dashoffset", 0);

    // Add dots for active line
    svg.selectAll(".active-dot")
        .data(lineData)
        .enter().append("circle")
        .attr("class", "cat-group stayed-data active-dot")
        .attr("cx", function(d) { return x(d.week); })
        .attr("cy", function(d) { return y(d.active); })
        .attr("r", 6)
        .attr("fill", "green")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .style("opacity", 0)
        .on("mouseover", function(event, d) {
            tooltip.classed("hidden", false);
            tooltip.html("<h3>" + d.week + " (Active)</h3><p>" + d.active.toFixed(2) + " visits/week</p><p>" + activeCount.toLocaleString() + " members</p>");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 15) + "px");
            tooltip.style("top", (event.pageY - 15) + "px");
        })
        .on("mouseout", function() { tooltip.classed("hidden", true); })
        .transition().delay(800).duration(300)
        .style("opacity", 1);

    // Add dots for churned line
    svg.selectAll(".churned-dot")
        .data(lineData)
        .enter().append("circle")
        .attr("class", "cat-group churned-data churned-dot")
        .attr("cx", function(d) { return x(d.week); })
        .attr("cy", function(d) { return y(d.churned); })
        .attr("r", 6)
        .attr("fill", "red")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .style("opacity", 0)
        .on("mouseover", function(event, d) {
            tooltip.classed("hidden", false);
            tooltip.html("<h3>" + d.week + " (Churned)</h3><p>" + d.churned.toFixed(2) + " visits/week</p><p>" + churnedCount.toLocaleString() + " members</p>");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 15) + "px");
            tooltip.style("top", (event.pageY - 15) + "px");
        })
        .on("mouseout", function() { tooltip.classed("hidden", true); })
        .transition().delay(800).duration(300)
        .style("opacity", 1);

    // Add value labels and annotation after animation
    setTimeout(function() {
        if (currentScene !== 5) return;

        // Value labels at each data point
        lineData.forEach(function(d) {
            svg.append("text")
                .attr("class", "value-label cat-group stayed-data")
                .attr("x", x(d.week))
                .attr("y", y(d.active) - 12)
                .attr("text-anchor", "middle")
                .text(d.active.toFixed(2))
                .style("font-size", "11px")
                .style("font-weight", "bold")
                .style("fill", "green")
                .style("opacity", 0)
                .transition().duration(300)
                .style("opacity", 1);

            svg.append("text")
                .attr("class", "value-label cat-group churned-data")
                .attr("x", x(d.week))
                .attr("y", y(d.churned) + 20)
                .attr("text-anchor", "middle")
                .text(d.churned.toFixed(2))
                .style("font-size", "11px")
                .style("font-weight", "bold")
                .style("fill", "red")
                .style("opacity", 0)
                .transition().duration(300)
                .style("opacity", 1);
        });

        // Static annotation highlighting the diverging trajectories
        let week3 = lineData[2];
        let churnedDrop = ((1 - lineData[3].churned / lineData[0].churned) * 100).toFixed(0);
        let activeDrop = ((1 - lineData[3].active / lineData[0].active) * 100).toFixed(0);
        let annotations = [{
            note: {
                label: "Churned members' attendance drops " + churnedDrop + "% from Week 1 to 4, while active members only drop " + activeDrop + "% — the decline predicts who will quit",
                wrap: 180
            },
            connector: { end: "arrow" },
            x: x("Week 2"),
            y: y(lineData[1].active) - 15,
            dx: 0,
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
    }, 1100);
}
