let currentScene = 1;
let myData = [];

let margin = { top: 60, right: 100, bottom: 60, left: 60 };
let w = 840 - margin.left - margin.right;
let h = 500 - margin.top - margin.bottom;

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
    xAxisGroup.selectAll("*").remove();
    yAxisGroup.selectAll("*").remove();
    xAxisGroup.style("opacity", 1);
    yAxisGroup.style("opacity", 1);
    xLabel.text("");
}

d3.csv("gym_ghosts_master.csv").then(function(data) {
    for (let i = 0; i < data.length; i++) {
        data[i].churned_by_february = Number(data[i].churned_by_february);
        data[i].age = Number(data[i].age);
        
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
    
    if (num === 1) {
        desc.html("This dataset tracks the many people who sign up to go to the gym in January and how many people stop or continue to show up.<br><br>What is churn? Churn means a member simply stopped going to the gym or cancelled their membership by the end of February.");
        drawFirstChart();
    } else if (num === 2) {
        desc.text("Demographics: Churn rate by age group. There is an inverse relationship where increasing age leads to decreasing churn.");
        drawGroupedBarChart("age_bin", "Age Group", ["<25", "25-39", "40-54", "55+"]);
    } else if (num === 3) {
        desc.text("Commitment: Churn by length of membership, higher churn rates are associated with shorter contracts. Perhaps people want to get their money's worth.");
        drawGroupedBarChart("contract_type", "Contract Type", ["month_to_month", "6_month", "annual"]);
    } else if (num === 4) {
        desc.text("Distance: Churn by distance to the gym, we see higher churn rates with those farther away from the gym.");
        drawConcentricCircles("dist_bin", ["0-1", "1-3", "3-5", "5+"]);
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

    let chartData = [
        { name: "Stayed (Active)", val: stayPercent, c: "green", cls: "stayed-data" },
        { name: "Churned", val: churnPercent, c: "red", cls: "churned-data" }
    ];

    let x = d3.scaleBand().domain(["Stayed (Active)", "Churned"]).range([w/4, 3*w/4]).padding(0.4);
    let y = d3.scaleLinear().domain([0, 100]).range([h, 0]);

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
            tooltip.html("<h3>" + d.name + "</h3><p>" + d.val.toFixed(1) + "%</p>");
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
            chartData.push({ key: groupName, Stayed: sPct, Churned: cPct });
        }
    }

    let x0 = d3.scaleBand().domain(chartData.map(d => d.key)).range([0, w]).padding(0.2);
    let x1 = d3.scaleBand().domain(["Stayed", "Churned"]).range([0, x0.bandwidth()]).padding(0.05);
    let y = d3.scaleLinear().domain([0, 100]).range([h, 0]);

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
            tooltip.html("<h3>" + d.key + " (Active)</h3><p>" + d.Stayed.toFixed(1) + "%</p>");
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
            tooltip.html("<h3>" + d.key + " (Churned)</h3><p>" + d.Churned.toFixed(1) + "%</p>");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 15) + "px");
            tooltip.style("top", (event.pageY - 15) + "px");
        })
        .on("mouseout", function() { tooltip.classed("hidden", true); })
        
        .transition().duration(700)
        .attr("y", function(d) { return y(d.Churned); })
        .attr("height", function(d) { return h - y(d.Churned); });


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
            chartData.push({ key: groupName, Stayed: sPct, Churned: cPct });
        }
    }

    let centerX = w / 2;
    let centerY = h / 2;

    svg.append("circle").attr("class", "cat-group").attr("cx", centerX).attr("cy", centerY).attr("r", 6).attr("fill", "black");
    svg.append("text").attr("class", "cat-group").attr("x", centerX).attr("y", centerY + 18).attr("text-anchor", "middle").text("GYM").style("font-size", "12px").style("font-weight", "bold");

    let greens = ["#006400", "#228B22", "#32CD32", "#90EE90"];
    let reds = ["#8B0000", "#B22222", "#DC143C", "#F08080"];

    let currentInner = 30;

    for (let i = 0; i < chartData.length; i++) {
        let d = chartData[i];

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
                tooltip.html("<h3>" + d.key + " miles (Active)</h3><p>" + d.Stayed.toFixed(1) + "%</p>");
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
                tooltip.html("<h3>" + d.key + " miles (Churned)</h3><p>" + d.Churned.toFixed(1) + "%</p>");
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
}

