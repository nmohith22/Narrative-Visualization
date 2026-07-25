let currentScene = 1;
let myData = [];

let margin = { top: 90, right: 120, bottom: 70, left: 70 };
let w = 900 - margin.left - margin.right;
let h = 540 - margin.top - margin.bottom;

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
