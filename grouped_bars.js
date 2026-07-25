function drawGroupedBarChart(colName, xText, orderArr) {
    clearCharts();
    drawLegend();
    
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

    let x0 = d3.scaleBand().domain(chartData.map(d => d.key)).range([0, w]).padding(0.2);
    let x1 = d3.scaleBand().domain(["Stayed", "Churned"]).range([0, x0.bandwidth()]).padding(0.05);
    let y = d3.scaleLinear().domain([0, 100]).range([h, 0]);

    addGridlines(y);
    xAxisGroup.transition().duration(500).call(d3.axisBottom(x0));
    yAxisGroup.transition().duration(500).call(d3.axisLeft(y).tickFormat(d => d + "%"));
    xLabel.text(xText);
    yLabel.text("Percentage (%)");

    let catGroups = svg.selectAll(".cat-group").data(chartData).enter().append("g")
        .attr("class", "cat-group")
        .attr("transform", function(d) { return "translate(" + x0(d.key) + ",0)"; });
        
    catGroups.append("rect")
        .attr("class", "stayed-data")
        .attr("x", x1("Stayed"))
        .attr("y", h)
        .attr("width", x1.bandwidth())
        .attr("height", 0)
        .attr("fill", "green")
        
        // source: https://d3-graph-gallery.com/graph/interactivity_tooltip.html
        .on("mouseover", function(event, d) {
            tooltip.classed("hidden", false);
            tooltip.html("<h3>" + d.key + " (Active)</h3><p>" + d.Stayed.toFixed(1) + "% &bull; " + d.stayedCount.toLocaleString() + " of " + d.total.toLocaleString() + " members</p>");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 15) + "px");
            tooltip.style("top", (event.pageY - 15) + "px");
        })
        .on("mouseout", function() { tooltip.classed("hidden", true); })
        
        .transition().duration(700)
        .attr("y", function(d) { return y(d.Stayed); })
        .attr("height", function(d) { return h - y(d.Stayed); });
        
    catGroups.append("rect")
        .attr("class", "churned-data")
        .attr("x", x1("Churned"))
        .attr("y", h)
        .attr("width", x1.bandwidth())
        .attr("height", 0)
        .attr("fill", "red")
        
        // source: https://d3-graph-gallery.com/graph/interactivity_tooltip.html
        .on("mouseover", function(event, d) {
            tooltip.classed("hidden", false);
            tooltip.html("<h3>" + d.key + " (Churned)</h3><p>" + d.Churned.toFixed(1) + "% &bull; " + d.churnedCount.toLocaleString() + " of " + d.total.toLocaleString() + " members</p>");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 15) + "px");
            tooltip.style("top", (event.pageY - 15) + "px");
        })
        .on("mouseout", function() { tooltip.classed("hidden", true); })
        
        .transition().duration(700)
        .attr("y", function(d) { return y(d.Churned); })
        .attr("height", function(d) { return h - y(d.Churned); });

    // Add value labels and static annotation after bars finish animating
    let savedScene = currentScene;
    setTimeout(function() {
        if (currentScene !== savedScene) return;

        // Value labels above each bar
        chartData.forEach(function(d) {
            svg.append("text")
                .attr("class", "value-label cat-group stayed-data")
                .attr("x", x0(d.key) + x1("Stayed") + x1.bandwidth() / 2)
                .attr("y", y(d.Stayed) - 5)
                .attr("text-anchor", "middle")
                .text(d.Stayed.toFixed(1) + "%")
                .style("font-size", "11px")
                .style("font-weight", "bold")
                .style("fill", "#f8fafc")
                .style("opacity", 0)
                .transition().duration(300)
                .style("opacity", 1);

            svg.append("text")
                .attr("class", "value-label cat-group churned-data")
                .attr("x", x0(d.key) + x1("Churned") + x1.bandwidth() / 2)
                .attr("y", y(d.Churned) - 5)
                .attr("text-anchor", "middle")
                .text(d.Churned.toFixed(1) + "%")
                .style("font-size", "11px")
                .style("font-weight", "bold")
                .style("fill", "#f8fafc")
                .style("opacity", 0)
                .transition().duration(300)
                .style("opacity", 1);
        });

        // Scene-specific static annotation
        let annotationData;
        if (savedScene === 2) {
            // Compare youngest vs oldest churn rates
            let youngest = chartData[0]; // <25
            let oldest = chartData[chartData.length - 1]; // 55+
            let ratio = (youngest.Churned / oldest.Churned).toFixed(1);
            annotationData = [{
                note: {
                    label: "Under-25 members are " + ratio + "x more likely to churn than those 55+ (" + youngest.Churned.toFixed(1) + "% vs " + oldest.Churned.toFixed(1) + "%)",
                    wrap: 150
                },
                connector: { end: "arrow" },
                x: x0("<25") + x1("Churned") + x1.bandwidth() / 2,
                y: y(youngest.Churned) - 15,
                dx: 0,
                dy: -90
            }];
        } else if (savedScene === 3) {
            // Compare month-to-month vs annual churn rates
            let mtm = chartData[0]; // month_to_month
            let annual = chartData[chartData.length - 1]; // annual
            let ratio = (mtm.Churned / annual.Churned).toFixed(1);
            annotationData = [{
                note: {
                    label: "Month-to-month members are " + ratio + "x more likely to churn than annual members (" + mtm.Churned.toFixed(1) + "% vs " + annual.Churned.toFixed(1) + "%)",
                    wrap: 150
                },
                connector: { end: "arrow" },
                x: x0("month_to_month") + x1("Churned") + x1.bandwidth() / 2,
                y: y(mtm.Churned) - 15,
                dx: 0,
                dy: -90
            }];
        }

        if (annotationData) {
            let makeAnnotations = d3.annotation()
                .type(d3.annotationCalloutElbow)
                .annotations(annotationData);

            svg.append("g")
                .attr("class", "annotation-group cat-group")
                .call(makeAnnotations)
                .style("opacity", 0)
                .transition().duration(500)
                .style("opacity", 1);
        }
    }, 750);
}
