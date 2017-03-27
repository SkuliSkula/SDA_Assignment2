// Declare the global variables
var data2003, data2015, joinedData = [];
var svgScatter = undefined;
var margin = {
        top: 40
        , right: 20
        , bottom: 30
        , left: 30
    }
    , width = 960 - margin.left - margin.right
    , height = 500 - margin.top - margin.bottom;
var padding = 65;
var xScale, yScale, rScale, tip;

// Reading data for 2003
function loadScatterplotData() {
    d3.csv("https://gist.githubusercontent.com/SkuliSkula/cd6604c5f2edc3e2838c149eeba8bc22/raw/ecbf3a0c79e6a92b10bf3659f60f03d9bc3b758d/distr_prost_vt_count_2003.csv", function (error, data) {
        if (error) {
            console.log("Error: ", error);
        }
        else {
            data.map(function (d) {
                joinedData.push({
                    "Prostitution": +d.prostitution
                    , "Vehicle_theft": +d.vehicle_theft
                });
            });
            data2003 = data;
            loadSecondDataSet();
        }
    });
}
// Load the data for 2015
function loadSecondDataSet() {
    d3.csv("https://gist.githubusercontent.com/SkuliSkula/2ca407f49ff55ff4cf994706a586f022/raw/58f1a9452d94c02c7f96b57a2aa0d31bec1b7bf0/distr_prost_vt_count_2015.csv", function (error, data) {
        if (error) {
            console.log("Error: ", error);
        }
        else {
            data.map(function (d) {
                joinedData.push({
                    "Prostitution": +d.prostitution
                    , "Vehicle_theft": +d.vehicle_theft
                });
            });
            data2015 = data;
            initVisualization(data2003, joinedData);
        }
    });
}
// Switch between dataset from 2003 and 2015
function switchData(data) {
    var dataset = [];
    if (data) {
        dataset = data2003;
    }
    else {
        dataset = data2015;
    }
    svgScatter.selectAll("circle")
        .data(dataset)
        .transition()
        .delay(function (d, i) {
            return i / dataset.length * 1000;
        })
        .duration(500)
        .ease("linear")
        .attr("cx", function (d) {
            return xScale(+d.prostitution);
        }).attr("cy", function (d) {
            return yScale(+d.vehicle_theft);
        }).attr("r", function (d) {
            return rScale((+d.prostitution + +d.vehicle_theft));
        });
    // Add Text Labels
    svgScatter.selectAll("text")
        .data(dataset).text(function (d) {
            return d.district;
        }).attr("x", function (d) {
            return xScale(+d.prostitution);
        }).attr("y", function (d) {
            return -10 + yScale(+d.vehicle_theft);
        });
}
// initialize the scatter plot
function initVisualization(data, joinedData) {
    // Create an array with Count only to get the max for scaling
    var countProstitutionArray = [];
    var countVehicleTheftArray = [];
    joinedData.map(function (d) {
            countProstitutionArray.push(parseInt(d.Prostitution));
            countVehicleTheftArray.push(parseInt(d.Vehicle_theft));
        })
        // Join the data so we can scale the radius
    var joined = data.map(function (d) {
        return (+d.prostitution + +d.vehicle_theft);
    });
    xScale = d3.scale.linear().domain([0, d3.max(countProstitutionArray, function (d) {
        return d;
    })]).range([padding, width - padding * 2]);
    yScale = d3.scale.linear().domain([0, d3.max(countVehicleTheftArray, function (d) {
        return d;
    })]).range([height - padding, padding]);
    rScale = d3.scale.linear().domain([0, d3.max(joined, function (d) {
        return d;
    })]).range([2, 10]);
    // Create the tooltip
    tip = d3.tip().attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<strong>" + "Prostitution" + ": " + "</strong> <span style='color:red'>" + d.prostitution + "</span>" + "<strong>" + ", Vehicle Theft: " + "<span style='color:red'>" + d.vehicle_theft + "</span>";
    });
    // Create the SVG
    svgScatter = d3.select("#visualization1")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    svgScatter.call(tip);
    svgScatter.selectAll("#scatter")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("cx", function (d) {
            return xScale(+d.prostitution);
        }).attr("cy", function (d) {
            return yScale(+d.vehicle_theft);
        }).attr("r", function (d) {
            return rScale((+d.prostitution + +d.vehicle_theft));
        }).attr("fill", function (d, i) {
            return color(i);
        }).on('mouseover', tip.show).on('mouseout', tip.hide);
    
    // Add Text Labels
    svgScatter.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "district")
        .text(function (d) {
            return d.district;
        }).attr("x", function (d) {
            return xScale(+d.prostitution);
        }).attr("y", function (d) {
            return -10 + yScale(+d.vehicle_theft);
        }).attr("fill", function (d, i) {
            return color(i);
    });
    // Create the Axis
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(5);
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(5);
    
    // Add the x-axis
    svgScatter.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height - padding) + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "labelaxis")
        .attr("y", 45)
        .attr("x", 360)
        .text("Prostitution");
    // Add the y-axis
    svgScatter.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis)
        .append("text")
        .attr("class", "labelaxis")
        .attr("transform", "rotate(-90)")
        .attr("y", 200)
        .attr("x", 20)
        .attr("dy", "-15.5em")
        .attr("dx", "-12em")
        .style("text-anchor", "end")
        .text("Vehicle theft");
}
// Those are the google colors used to color the scatterplot circles
function color(n) {
    var colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
    return colores_g[n % colores_g.length];
}