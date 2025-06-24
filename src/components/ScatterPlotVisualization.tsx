
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { EmissionData } from '@/utils/dataGenerator';

interface ScatterPlotProps {
  data: EmissionData[];
  selectedYear: number;
}

const ScatterPlotVisualization: React.FC<ScatterPlotProps> = ({ data, selectedYear }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Filter data for selected year
    const yearData = data.filter(d => d.year === selectedYear);

    const margin = { top: 20, right: 20, bottom: 80, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.bottom - margin.top;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLog()
      .domain([
        Math.min(...yearData.map(d => d.gdp_per_capita)),
        Math.max(...yearData.map(d => d.gdp_per_capita))
      ])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(yearData, d => d.co2_emissions) || 0])
      .range([height, 0]);

    // Size scale for population (bubble size)
    const sizeScale = d3
      .scaleSqrt()
      .domain([0, d3.max(yearData, d => d.population) || 0])
      .range([3, 30]);

    // Color scale based on CO2 emissions
    const colorScale = d3
      .scaleSequential()
      .domain([0, d3.max(yearData, d => d.co2_emissions) || 0])
      .interpolator(d3.interpolateRdYlBu);

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.8)")
      .style("color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("font-size", "12px")
      .style("z-index", 1000);

    // Draw circles
    g.selectAll(".bubble")
      .data(yearData)
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("cx", d => xScale(d.gdp_per_capita))
      .attr("cy", d => yScale(d.co2_emissions))
      .attr("r", 0)
      .attr("fill", d => colorScale(d.co2_emissions))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("opacity", 0.7)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("opacity", 1)
          .attr("stroke-width", 2);

        tooltip
          .transition()
          .duration(200)
          .style("opacity", 1);
        
        tooltip
          .html(`
            <strong>${d.country}</strong><br/>
            GDP per capita: $${d.gdp_per_capita.toLocaleString()}<br/>
            CO₂ Emissions: ${d.co2_emissions.toLocaleString()} Mt<br/>
            Population: ${d.population.toLocaleString()}M<br/>
            Emissions per capita: ${(d.co2_emissions / d.population * 1000).toFixed(1)} t
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("opacity", 0.7)
          .attr("stroke-width", 1);

        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0);
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 20)
      .attr("r", d => sizeScale(d.population));

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d => `$${d3.format(".0s")(d as number)}`))
      .style("font-size", "12px");

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .style("font-size", "12px");

    // Axis labels
    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + 50})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#666")
      .text("GDP per Capita (USD, log scale)");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#666")
      .text("CO₂ Emissions (Million Tonnes)");

    // Legend for bubble sizes
    const sizeLegend = g.append("g")
      .attr("class", "size-legend")
      .attr("transform", `translate(${width - 150}, ${height - 100})`);

    sizeLegend.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("Population (millions)");

    const populationSamples = [10, 100, 500, 1000];
    populationSamples.forEach((pop, i) => {
      const legendRow = sizeLegend.append("g")
        .attr("transform", `translate(0, ${i * 25})`);

      legendRow.append("circle")
        .attr("cx", 15)
        .attr("cy", 0)
        .attr("r", sizeScale(pop))
        .attr("fill", "none")
        .attr("stroke", "#666")
        .attr("stroke-width", 1);

      legendRow.append("text")
        .attr("x", 35)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .style("font-size", "11px")
        .style("fill", "#666")
        .text(`${pop}M`);
    });

    // Color legend
    const colorLegendWidth = 200;
    const colorLegendHeight = 10;
    
    const colorLegend = g.append("g")
      .attr("class", "color-legend")
      .attr("transform", `translate(${width - colorLegendWidth - 20}, 20)`);

    const colorGradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "color-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", colorLegendWidth).attr("y2", 0);

    const colorStops = d3.range(0, 1.01, 0.1);
    colorStops.forEach(t => {
      colorGradient.append("stop")
        .attr("offset", `${t * 100}%`)
        .attr("stop-color", colorScale(t * (d3.max(yearData, d => d.co2_emissions) || 0)));
    });

    colorLegend.append("rect")
      .attr("width", colorLegendWidth)
      .attr("height", colorLegendHeight)
      .style("fill", "url(#color-gradient)");

    colorLegend.append("text")
      .attr("x", 0)
      .attr("y", -5)
      .style("font-size", "11px")
      .style("fill", "#666")
      .text("Low CO₂");

    colorLegend.append("text")
      .attr("x", colorLegendWidth)
      .attr("y", -5)
      .style("text-anchor", "end")
      .style("font-size", "11px")
      .style("fill", "#666")
      .text("High CO₂");

    // Cleanup tooltip on unmount
    return () => {
      d3.selectAll(".tooltip").remove();
    };
  }, [data, selectedYear]);

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} className="w-full h-auto"></svg>
    </div>
  );
};

export default ScatterPlotVisualization;
