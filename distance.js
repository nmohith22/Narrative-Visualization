function drawConcentricCircles(colName, orderArr) {
    clearCharts();
    drawLegend();
    
    xAxisGroup.style("opacity", 0);
    yAxisGroup.style("opacity", 0);
    xLabel.text("");
    yLabel.text("");
    
    let chartData = [];
    for (let i = 0; i < orderArr.length; i++) {
        let groupName = orderArr[i];
        let total = 0;
        let churned = 0;
        
        for (let j = 0; j < myData.length; j++) {
            if (myData[j][colName] === groupName) {
                total++;
                churned += myData[j].churned_by_february;
            }
        }
        
        if (total > 0) {
            let cPct = (churned / total) * 100;
            let sPct = 100 - cPct;
            chartData.push({ key: groupName, Stayed: sPct, Churned: cPct, total: total, churnedCount: churned, stayedCount: total - churned });
        }
    }

    let centerX = w / 2;
    let centerY = h / 2;

    svg.append("circle").attr("class", "cat-group").attr("cx", centerX).attr("cy", centerY).attr("r", 8).attr("fill", "black");
    svg.append("text").attr("class", "cat-group").attr("x", centerX).attr("y", centerY + 22).attr("text-anchor", "middle").text("GYM").style("font-size", "13px").style("font-weight", "bold");

    let greens = ["#006400", "#228B22", "#32CD32", "#90EE90"];
    let reds = ["#8B0000", "#B22222", "#DC143C", "#F08080"];

    let ringThick = 36;
    let ringGap = 12;
    let currentInner = 30;
    let lastRingData = null;
    let lastMidRadius = 0;

    for (let i = 0; i < chartData.length; i++) {
        let d = chartData[i];
        lastRingData = d;
        lastMidRadius = currentInner + ringThick / 2;

        // Calculate churn angle (0 to 2*PI scaled by Churned percentage)
        let churnAngle = (d.Churned / 100) * 2 * Math.PI;

        // Red arc (Churned) - spans from 0 to churnAngle along the circumference
        let redArc = d3.arc()
            .innerRadius(currentInner)
            .outerRadius(currentInner + ringThick)
            .startAngle(0)
            .endAngle(churnAngle);

        svg.append("path")
            .attr("class", "cat-group churned-data")
            .attr("transform", "translate(" + centerX + "," + centerY + ")")
            .attr("d", redArc)
            .attr("fill", reds[i])
            .on("mouseover", function() {
                tooltip.classed("hidden", false);
                tooltip.html("<h3>" + d.key + " miles (Churned)</h3><p>" + d.Churned.toFixed(1) + "% &bull; " + d.churnedCount.toLocaleString() + " of " + d.total.toLocaleString() + " members</p>");
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 15) + "px");
            })
            .on("mouseout", function() { tooltip.classed("hidden", true); })
            .attr("opacity", 0)
            .transition().duration(700)
            .attr("opacity", 1);

        // Green arc (Active) - spans remaining circumference from churnAngle to 2*PI
        let greenArc = d3.arc()
            .innerRadius(currentInner)
            .outerRadius(currentInner + ringThick)
            .startAngle(churnAngle)
            .endAngle(2 * Math.PI);

        svg.append("path")
            .attr("class", "cat-group stayed-data")
            .attr("transform", "translate(" + centerX + "," + centerY + ")")
            .attr("d", greenArc)
            .attr("fill", greens[i])
            .on("mouseover", function() {
                tooltip.classed("hidden", false);
                tooltip.html("<h3>" + d.key + " miles (Active)</h3><p>" + d.Stayed.toFixed(1) + "% &bull; " + d.stayedCount.toLocaleString() + " of " + d.total.toLocaleString() + " members</p>");
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 15) + "px");
            })
            .on("mouseout", function() { tooltip.classed("hidden", true); })
            .attr("opacity", 0)
            .transition().duration(700)
            .attr("opacity", 1);

        // Position text labels at midpoint of each arc segment
        let midR = currentInner + ringThick / 2;

        // Red arc label
        let midRedAngle = churnAngle / 2;
        let redX = centerX + midR * Math.sin(midRedAngle);
        let redY = centerY - midR * Math.cos(midRedAngle);

        let rText = svg.append("text")
            .attr("class", "cat-group")
            .attr("x", redX)
            .attr("y", redY)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .style("font-size", "11px")
            .style("font-weight", "bold")
            .style("pointer-events", "none");

        rText.append("tspan").attr("x", redX).attr("dy", "-0.4em").text(d.key + " mi");
        rText.append("tspan").attr("x", redX).attr("dy", "1.2em").text(d.Churned.toFixed(1) + "% Churned");

        // Green arc label
        let midGreenAngle = churnAngle + (2 * Math.PI - churnAngle) / 2;
        let greenX = centerX + midR * Math.sin(midGreenAngle);
        let greenY = centerY - midR * Math.cos(midGreenAngle);

        let gText = svg.append("text")
            .attr("class", "cat-group")
            .attr("x", greenX)
            .attr("y", greenY)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .style("font-size", "11px")
            .style("font-weight", "bold")
            .style("pointer-events", "none");

        gText.append("tspan").attr("x", greenX).attr("dy", "-0.4em").text(d.key + " mi");
        gText.append("tspan").attr("x", greenX).attr("dy", "1.2em").text(d.Stayed.toFixed(1) + "% Active");

        currentInner = currentInner + ringThick + ringGap;
    }

    // Static annotation on the outermost ring (5+ miles) with no connector line
    setTimeout(function() {
        if (currentScene !== 4) return;

        if (lastRingData) {
            let closest = chartData[0]; // 0-1 miles
            let farthest = lastRingData; // 5+ miles
            let diff = (farthest.Churned - closest.Churned).toFixed(1);
            let annotations = [{
                note: {
                    label: "Members 5+ miles away churn " + diff + " percentage points more than those within 1 mile (" + farthest.Churned.toFixed(1) + "% vs " + closest.Churned.toFixed(1) + "%)",
                    wrap: 180
                },
                x: centerX - 90,
                y: centerY - 210,
                dx: 0,
                dy: 0
            }];

            let makeAnnotations = d3.annotation()
                .type(d3.annotationLabel)
                .annotations(annotations);

            svg.append("g")
                .attr("class", "annotation-group cat-group")
                .call(makeAnnotations)
                .style("opacity", 0)
                .transition().duration(500)
                .style("opacity", 1);
        }
    }, 800);
}
