// Declare the global variables
var svgGEO = undefined;
var w = 960;
var h = 500;
var kData = [];
var kMeansData = {};
//Define map projection
var projection = d3.geo.mercator().scale(155000).center([-122.45, 37.76]) // Center the Map in San Francisco
    .translate([w / 2, h / 2]);
//Load in GeoJSON data
function loadGeoJSONData() {
    d3.json("https://gist.githubusercontent.com/SkuliSkula/ef293552320cea71928b7c92634ed5f2/raw/f7c8bc58b592b4af0e01703787b7cdf1f2db3e78/geodata.geojson", function (error, data) {
        if (error) {
            console.log(error);
        }
        else {
            initGeoVisualization(data);
            loadKData();
        }
    });
}
// Load the data lat and lon for k
function loadKData() {
    d3.csv("https://gist.githubusercontent.com/SkuliSkula/71a4946b7202437bd37eb4daeaca7668/raw/efb16d458edaae3b5b2ef469f08cfbb87bd0d5a5/k_means_lat_lon.csv", function (error, data) {
        if (error) {
            console.log(error);
        }
        else {
            kData = data;
            initKData(kData);
            loadKMeansData();
        }
    });
}
// Load the data for the k means circles
function loadKMeansData() {
    d3.json("https://gist.githubusercontent.com/SkuliSkula/70d040b30a179db41af89d83e89e98cc/raw/3d76e7f351056c3978a3361cbc93de42965e1bf1/k_means_cluster_centers.json", function (error, data) {
        if (error) console.log("LoadKMeans error: ", error);
        else kMeansData = data;
        initGeoKMeansCircles();
    });
}
// Initialize the K data (the small dots)
function initKData(data) {
    svgGEO.selectAll(".in")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "kCircle")
        .attr("cx", function (d) {
            return projection([d.lon, d.lat])[0];
        }).attr("cy", function (d) {
            return projection([d.lon, d.lat])[1];
        }).attr("r", 1.5).attr("fill", function (d, i) {
            if (+d.k2 == 0) return colorKCircle(0);
            else if (d.k2 == 1) return colorKCircle(1);
    });
}
// Remove the Kmeans circles
function removeCircles() {
    svgGEO.selectAll(".geokmeans").remove();
}
// Initialize the KMeans circles
function initGeoKMeansCircles(k) {
    var dataK = [];
    if (!k) {
        dataK = jsonToArray("k2");
    }
    else {
        removeCircles();
        dataK = jsonToArray(k);
    }
    svgGEO.selectAll(".out")
        .data(dataK[0])
        .enter()
        .append("circle")
        .attr("class", "geokmeans")
        .attr("cx", function (d) {
            return projection([d.lon, d.lat])[0];
        }).attr("cy", function (d) {
            return projection([d.lon, d.lat])[1];
        }).attr("r", 9);
}
// Initialize the map of San Francisco
function initGeoVisualization(data) {
    //Define default path generator
    var path = d3.geo.path().projection(projection);
    //Create SVG element
    svgGEO = d3.select("#visualization2")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .style("background-color", "lightgray");
    //Bind data and create one path per GeoJSON feature
    svgGEO.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("class", "geodistrict")
        .attr("d", path)
        // Add district labels
    svgGEO.selectAll("text")
        .data(data.features)
        .enter()
        .append("svg:text")
        .attr("class", "geodistricttext").text(function (d) {
        return d.properties.DISTRICT;
    }).attr("x", function (d) {
        return path.centroid(d)[0];
    }).attr("y", function (d) {
        return path.centroid(d)[1];
    });
}
// Switch data between different values of k (k=2,3,4,5,6)
function showKData(k) {
    initGeoKMeansCircles(k);
    svgGEO.selectAll("circle")
        .data(kData)
        .attr("cx", function (d) {
            return projection([d.lon, d.lat])[0];
        }).attr("cy", function (d) {
            return projection([d.lon, d.lat])[1];
        }).attr("r", 1.5).attr("fill", function (d, i) {
            if (k == "k2") {
                if (+d.k2 === 0) return colorKCircle(0);
                else if (+d.k2 === 1) return colorKCircle(1);
        }
            else if (k == "k3") {
                if (+d.k3 === 0) return colorKCircle(0);
                else if (+d.k3 === 1) return colorKCircle(1);
                else if (+d.k3 === 2) return colorKCircle(2);
            }
            else if (k == "k4") {
                if (+d.k4 === 0) return colorKCircle(0);
                else if (+d.k4 === 1) return colorKCircle(1);
                else if (+d.k4 === 2) return colorKCircle(2);
                else if (+d.k4 === 3) return colorKCircle(3);
            }
            else if (k == "k5") {
                if (+d.k5 === 0) return colorKCircle(0);
                else if (+d.k5 === 1) return colorKCircle(1);
                else if (+d.k5 === 2) return colorKCircle(2);
                else if (+d.k5 === 3) return colorKCircle(3);
                else if (+d.k5 === 4) return colorKCircle(4);
            }
            else {
                if (+d.k6 === 0) return colorKCircle(0);
                else if (+d.k6 === 1) return colorKCircle(1);
                else if (+d.k6 === 2) return colorKCircle(2);
                else if (+d.k6 === 3) return colorKCircle(3);
                else if (+d.k6 === 4) return colorKCircle(4);
                else if (+d.k6 === 5) return colorKCircle(5);
            }
    });
}
// Colors for the k data
function colorKCircle(color) {
    var colores_g = ["#22aa99", "#dc3912", "#ff9900", "#990099", "#aaaa11", "#A9A9A9"];
    return colores_g[color];
}
// Change the json object with the kMeansdata to an array so we can give it as a dataset
function jsonToArray(k) {
    var temp = [];
    for (var i in kMeansData) {
        if (i == k) temp.push(kMeansData[i]);
    }
    return temp;
}