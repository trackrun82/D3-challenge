function makeResponsive() {

  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  const svgArea = d3.select("body").select("svg");

  // clear svg is not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // SVG wrapper dimensions are determined by the current width and
  // height of the browser window.
  const svgWidth = window.innerWidth;
  const svgHeight = window.innerHeight;

  const margin = {
    top: 20,
    bottom: 80,
    right: 40,
    left: 100
  };

  const height = svgHeight - margin.top - margin.bottom;
  const width = svgWidth - margin.left - margin.right;

  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  const svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // Append an SVG group
  const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
  let chosenXAxis = "poverty";
  let chosenYAxis = "obesity";

  // function used for updating x-scale var upon click on axis label
  function xScale(data, chosenXAxis) {
    // create scales
    const xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.9,
      d3.max(data, d => d[chosenXAxis]) * 1.1
      ])
      .range([0, width]);

    return xLinearScale;
  }

  // function used for updating y-scale var upon click on axis label
  function yScale(data, chosenYAxis) {
    // create scales
    const yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.9,
      d3.max(data, d => d[chosenYAxis]) * 1.1
      ])
      .range([height, 0]);

    return yLinearScale;
  }

  // function used for updating xAxis var upon click on axis label
  function renderxAxes(newXScale, xAxis) {
    const bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
  }

  // function used for updating yAxis var upon click on axis label
  function renderyAxes(newYScale, yAxis) {
    const leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

    return yAxis;
  }

  // function used for updating circles group with a transition to new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))

    return circlesGroup

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
  }

  // function used for updating circles text with a transition to new circles
  function renderStates(statesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    statesGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]));

    return statesGroup;

    statesGroup.transition()
    .duration(1000)
    .attr("y", d => newYScale(d[chosenYAxis]));

    return statesGroup;
  }

  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    let xlabel;

    if (chosenXAxis === "poverty") {
      xlabel = "Poverty %:";
    }
    else if (chosenXAxis === "age"){
      xlabel = "Age (Median):";
    }
    else {
      xlabel = "Household Income (Median):"
    }

    let ylabel;

    if (chosenYAxis === "obesity") {
      ylabel = "Obese %: ";
    }
    else if (chosenYAxis === "smokes"){
      ylabel = "Smokes %: ";
    }
    else {
      ylabel = "Lacks Healthcare %: "
    }

    const toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function (d) {
        return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
      });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function (data, index) {
        toolTip.hide(data);
      });

    return circlesGroup;
  };

  // Load data from data.csv
  d3.csv("assets/data/data.csv").then(function(data, err) {
    if (err) throw err;
    console.log(data);

    // parse data
    data.forEach(function (data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
      data.healthcare = +data.healthcare;
    });
    
    // xLinearScale function above csv import
    let xLinearScale = xScale(data, chosenXAxis);

    // Create y scale function
    let yLinearScale = yScale(data, chosenYAxis);
    
    // Create initial axis functions
    const bottomAxis = d3.axisBottom(xLinearScale);
    const leftAxis = d3.axisLeft(yLinearScale);
    
    // append x axis
    let xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
    
    // append y axis
    let yAxis = chartGroup.append("g")
      // .attr("dy", "1em")
      .call(leftAxis);
    
    // append initial circles
    let circlesGroup = chartGroup.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .classed("stateCircle", true)
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 10);

    // append initial state names
    let statesGroup = chartGroup.selectAll('div')
      .data(data)
      .enter()
      .append("text")
      .classed("stateText", true)
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .text(d => d.abbr)
      .attr('font-size', 10)
      .attr('dy', 4);
    
    // Create group for three x-axis labels
    const xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`)
    .classed("atext", true);
    
    const povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
    
    const ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    const incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");
    
    // Create group for three y-axis labels
    const ylabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)")
      // .attr("dy", "1em")
      .classed("atext", true);
  
    const obesityLabel = ylabelsGroup.append("text")
      .attr("x", 0- (height / 2))
      .attr("y", 20 - margin.left)
      .attr("value", "obesity") // value to grab for event listener
      .classed("active", true)
      .text("Obesity (%)");
    
    const smokesLabel = ylabelsGroup.append("text")
      .attr("x", 0- (height / 2))
      .attr("y", 40 - margin.left)
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes (%)");

    const healthcareLabel = ylabelsGroup.append("text")
      .attr("x", 0- (height / 2))
      .attr("y", 60 - margin.left)
      .attr("value", "healthcare") // value to grab for event listener
      .classed("inactive", true)
      .text("Lacks Healthcare (%)");
    
    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    
    // x axis labels event listener
    xlabelsGroup.selectAll("text")
      .on("click", function () {
        // get value of selection
        const xvalue = d3.select(this).attr("value");
        if (xvalue !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = xvalue;

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(data, chosenXAxis);

          // updates x axis with transition
          xAxis = renderxAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

          // updates states with new x values
          statesGroup = renderStates(statesGroup, xLinearScale, chosenXAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // changes classes to change bold text
          if (chosenXAxis === "age") {
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "poverty") {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true)
          }
          else {
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false) 
          }
        }
      });

    // y axis labels event listener
    ylabelsGroup.selectAll("text")
      .on("click", function () {
      // get value of selection
      const yvalue = d3.select(this).attr("value");
      if (yvalue !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = yvalue;

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(data, chosenYAxis);

        // updates y axis with transition
        yAxis = renderyAxes(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

        // updates states with new y values
        statesGroup = renderStates(statesGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true)
        }
        else {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false) 
        }
      }
    });
    }).catch(function(error) {
      console.log(error);
  });
};

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);