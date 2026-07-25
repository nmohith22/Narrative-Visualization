function goToScene(num) {
    currentScene = num;
    
    d3.selectAll("button").classed("active", false);
    d3.select("#btn-scene" + num).classed("active", true);
    
    let desc = d3.select("#scene-description");
    
    if (num === 1) {
        let totalCount = myData.length ? myData.length.toLocaleString() : "";
        desc.html("This dataset tracks the " + totalCount + " people who sign up to go to the gym in January and how many people stop or continue to show up.<br><br>What is churn? Churn means a member simply stopped going to the gym or cancelled their membership by the end of February.");
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
    } else if (num === 5) {
        desc.text("Behavior: Average weekly gym visits throughout January for members who stayed active vs. those who eventually churned.");
        drawLineChart();
    }
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
