let currentScene = 1;
let myData = [];

let margin = { top: 60, right: 120, bottom: 70, left: 70 };
let w = 900 - margin.left - margin.right;
let h = 520 - margin.top - margin.bottom;

let svg = d3.select("#viz-container")
    .append("svg")
    .attr("viewBox", `0 0 ${w + margin.left + margin.right} ${h + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("width", "100%")
    .style("height", "auto")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let tooltip = d3.select("#tooltip");

let xAxisGroup = svg.append("g").attr("transform", "translate(0," + h + ")");
let yAxisGroup = svg.append("g");

let yLabel = svg.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("x", -h / 2)
    .attr("y", -margin.left + 15)
    .text("Percentage (%)");

let xLabel = svg.append("text")
    .attr("class", "axis-label")
    .attr("text-anchor", "middle")
    .attr("x", w / 2)
    .attr("y", h + margin.bottom - 10)
    .text("");

function clearCharts() {
    svg.selectAll(".cat-group").remove();
    svg.selectAll(".legend-item").remove();
    svg.selectAll(".annotation-group").remove();
    svg.selectAll(".value-label").remove();
    svg.selectAll(".grid-lines").remove();
    xAxisGroup.selectAll("*").remove();
    yAxisGroup.selectAll("*").remove();
    xAxisGroup.style("opacity", 1);
    yAxisGroup.style("opacity", 1);
    xLabel.text("");
}

function addGridlines(yScale) {
    svg.insert("g", ":first-child")
        .attr("class", "grid-lines")
        .call(d3.axisLeft(yScale)
            .tickSize(-w)
            .tickFormat("")
        );
}

d3.csv("gym_ghosts_master.csv").then(function(data) {
    for (let i = 0; i < data.length; i++) {
        data[i].churned_by_february = Number(data[i].churned_by_february);
        data[i].age = Number(data[i].age);
        data[i].week1_visits = Number(data[i].week1_visits);
        data[i].week2_visits = Number(data[i].week2_visits);
        data[i].week3_visits = Number(data[i].week3_visits);
        data[i].week4_visits = Number(data[i].week4_visits);
        
        let miles = Number(data[i].distance_km) * 0.621371;
        
        if (miles <= 1) {
            data[i].dist_bin = "0-1";
        } else if (miles <= 3) {
            data[i].dist_bin = "1-3";
        } else if (miles <= 5) {
            data[i].dist_bin = "3-5";
        } else {
            data[i].dist_bin = "5+";
        }
        
        if (data[i].age < 25) {
            data[i].age_bin = "<25";
        } else if (data[i].age < 40) {
            data[i].age_bin = "25-39";
        } else if (data[i].age < 55) {
            data[i].age_bin = "40-54";
        } else {
            data[i].age_bin = "55+";
        }
    }
    
    myData = data;
    
    d3.select("#btn-scene1").on("click", function() { goToScene(1); });
    d3.select("#btn-scene2").on("click", function() { goToScene(2); });
    d3.select("#btn-scene3").on("click", function() { goToScene(3); });
    d3.select("#btn-scene4").on("click", function() { goToScene(4); });
    d3.select("#btn-scene5").on("click", function() { goToScene(5); });
    
    goToScene(1);
});

// source: https://d3-graph-gallery.com/graph/custom_legend.html
function drawLegend() {
    let legend = svg.append("g").attr("class", "legend-item");
    
    legend.append("rect")
        .attr("x", w - 20)
        .attr("y", -30)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", "green")
        .style("cursor", "pointer")
        .on("click", function() {
            let o = d3.selectAll(".stayed-data").style("opacity");
            if (o == 1) {
                d3.selectAll(".stayed-data").style("opacity", 0.1);
            } else {
                d3.selectAll(".stayed-data").style("opacity", 1);
            }
        });
        
    legend.append("text").attr("x", w).attr("y", -18).text("Active").style("font-size", "13px");

    legend.append("rect")
        .attr("x", w - 20)
        .attr("y", -10)
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", "red")
        .style("cursor", "pointer")
        .on("click", function() {
            let o = d3.selectAll(".churned-data").style("opacity");
            if (o == 1) {
                d3.selectAll(".churned-data").style("opacity", 0.1);
            } else {
                d3.selectAll(".churned-data").style("opacity", 1);
            }
        });
        
    legend.append("text").attr("x", w).attr("y", 2).text("Churned").style("font-size", "13px");
}

function goToScene(num) {
    currentScene = num;
    
    d3.selectAll("button").classed("active", false);
    d3.select("#btn-scene" + num).classed("active", true);
    
    let desc = d3.select("#scene-description");
    let takeaway = d3.select("#takeaway");
    takeaway.classed("hidden", false);
    
    if (num === 1) {
        desc.html("This dataset tracks the many people who sign up to go to the gym in January and how many people stop or continue to show up.<br><br>What is churn? Churn means a member simply stopped going to the gym or cancelled their membership by the end of February.");
        takeaway.html("\u{1F4A1} <strong>Key Takeaway:</strong> Nearly half of all January gym signups stop going by February \u2014 the \"New Year's Resolution\" effect is real.");
        drawFirstChart();
    } else if (num === 2) {
        desc.text("Demographics: Churn rate by age group. There is an inverse relationship where increasing age leads to decreasing churn.");
        takeaway.html("\u{1F4A1} <strong>Key Takeaway:</strong> Younger members (<25) are the most likely to quit. Retention improves steadily with age.");
        drawGroupedBarChart("age_bin", "Age Group", ["<25", "25-39", "40-54", "55+"]);
    } else if (num === 3) {
        desc.text("Commitment: Churn by length of membership, higher churn rates are associated with shorter contracts. Perhaps people want to get their money's worth.");
        takeaway.html("\u{1F4A1} <strong>Key Takeaway:</strong> Month-to-month members churn at far higher rates than those on 6-month or annual contracts.");
        drawGroupedBarChart("contract_type", "Contract Type", ["month_to_month", "6_month", "annual"]);
    } else if (num === 4) {
        desc.text("Distance: Churn by distance to the gym, we see higher churn rates with those farther away from the gym.");
        takeaway.html("\u{1F4A1} <strong>Key Takeaway:</strong> Members who live farther from the gym are significantly more likely to stop attending.");
        drawConcentricCircles("dist_bin", ["0-1", "1-3", "3-5", "5+"]);
    } else if (num === 5) {
        desc.text("Behavior: Average weekly gym visits throughout January for members who stayed active vs. those who eventually churned.");
        takeaway.html("\u{1F4A1} <strong>Key Takeaway:</strong> Members who eventually churn show a clear drop in weekly visits throughout January, while active members maintain steadier attendance.");
        drawLineChart();
    }
}

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
                label: churnPercent.toFixed(1) + "% of January signups quit by February",
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
                .style("fill", "#333")
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
                .style("fill", "#333")
                .style("opacity", 0)
                .transition().duration(300)
                .style("opacity", 1);
        });

        // Scene-specific static annotation
        let annotationData;
        if (savedScene === 2) {
            // Annotate <25 churned bar (highest churn age group)
            let targetData = chartData[0]; // <25 is first
            annotationData = [{
                note: {
                    label: targetData.Churned.toFixed(1) + "% of members under 25 quit",
                    title: "Youngest = Highest Churn",
                    wrap: 150
                },
                connector: { end: "arrow" },
                x: x0("<25") + x1("Churned") + x1.bandwidth() / 2,
                y: y(targetData.Churned),
                dx: 80,
                dy: -50
            }];
        } else if (savedScene === 3) {
            // Annotate month_to_month churned bar (highest churn contract)
            let targetData = chartData[0]; // month_to_month is first
            annotationData = [{
                note: {
                    label: targetData.Churned.toFixed(1) + "% churn with no long-term contract",
                    title: "No Commitment = More Dropout",
                    wrap: 150
                },
                connector: { end: "arrow" },
                x: x0("month_to_month") + x1("Churned") + x1.bandwidth() / 2,
                y: y(targetData.Churned),
                dx: 80,
                dy: -50
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

    svg.append("circle").attr("class", "cat-group").attr("cx", centerX).attr("cy", centerY).attr("r", 6).attr("fill", "black");
    svg.append("text").attr("class", "cat-group").attr("x", centerX).attr("y", centerY + 18).attr("text-anchor", "middle").text("GYM").style("font-size", "12px").style("font-weight", "bold");

    let greens = ["#006400", "#228B22", "#32CD32", "#90EE90"];
    let reds = ["#8B0000", "#B22222", "#DC143C", "#F08080"];

    let currentInner = 30;
    let lastRingData = null;
    let lastInner = 0;

    for (let i = 0; i < chartData.length; i++) {
        let d = chartData[i];
        lastInner = currentInner;
        lastRingData = d;

        let greenArc = d3.arc()
            .innerRadius(currentInner)
            .outerRadius(currentInner + d.Stayed)
            .startAngle(Math.PI)
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

        let redArc = d3.arc()
            .innerRadius(currentInner)
            .outerRadius(currentInner + d.Churned)
            .startAngle(0)
            .endAngle(Math.PI);

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

        let gText = svg.append("text")
            .attr("class", "cat-group")
            .attr("x", centerX - (currentInner + d.Stayed / 2))
            .attr("y", centerY)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .style("font-size", "10px")
            .style("pointer-events", "none");
            
        gText.append("tspan").attr("x", centerX - (currentInner + d.Stayed / 2)).attr("dy", "-0.5em").text(d.key + " miles");
        gText.append("tspan").attr("x", centerX - (currentInner + d.Stayed / 2)).attr("dy", "1.2em").text(d.Stayed.toFixed(1) + "%");

        let rText = svg.append("text")
            .attr("class", "cat-group")
            .attr("x", centerX + (currentInner + d.Churned / 2))
            .attr("y", centerY)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .style("font-size", "10px")
            .style("pointer-events", "none");
            
        rText.append("tspan").attr("x", centerX + (currentInner + d.Churned / 2)).attr("dy", "-0.5em").text(d.key + " miles");
        rText.append("tspan").attr("x", centerX + (currentInner + d.Churned / 2)).attr("dy", "1.2em").text(d.Churned.toFixed(1) + "%");

        currentInner = currentInner + Math.max(d.Stayed, d.Churned) + 15;
    }

    // Static annotation on the outermost ring (5+ miles)
    setTimeout(function() {
        if (currentScene !== 4) return;

        if (lastRingData) {
            let outerEdge = lastInner + lastRingData.Churned;
            let annotations = [{
                note: {
                    label: lastRingData.Churned.toFixed(1) + "% churn for members 5+ miles away",
                    title: "Distance Drives Dropout",
                    wrap: 140
                },
                connector: { end: "arrow" },
                x: centerX + outerEdge * 0.7,
                y: centerY - outerEdge * 0.7,
                dx: 40,
                dy: -30
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
        }
    }, 800);
}

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

        // Static annotation at Week 3 highlighting the divergence
        let week3 = lineData[2];
        let gap = (lineData[3].active - lineData[3].churned).toFixed(2);
        let annotations = [{
            note: {
                label: "By Week 4, churned members visit " + gap + " fewer times per week than active members",
                title: "The Attendance Gap",
                wrap: 160
            },
            connector: { end: "arrow" },
            x: x("Week 3"),
            y: y((week3.active + week3.churned) / 2),
            dx: -100,
            dy: -70
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
