
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { EmissionData } from '@/utils/dataGenerator';

interface BarChartProps {
  data: EmissionData[];
  selectedYear: number;
}

const BarChartVisualization: React.FC<BarChartProps> = ({ data, selectedYear }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Filter and sort data for selected year
    const yearData = data
      .filter(d => d.year === selectedYear)
      .sort((a, b) => b.co2_emissions - a.co2_emissions)
      .slice(0, 15); // Top 15 countries

    const margin = { top: 20, right: 30, bottom: 80, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.bottom - margin.top;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(yearData.map(d => d.country))
      .range([0, width])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(yearData, d => d.co2_emissions) || 0])
      .range([height, 0]);

    // Color scale
    const colorScale = d3
      .scaleSequential()
      .domain([0, yearData.length - 1])
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

    // Bars
    g.selectAll(".bar")
      .data(yearData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.country) || 0)
      .attr("y", height)
      .attr("width", xScale.bandwidth())
      .attr("height", 0)
      .attr("fill", (d, i) => colorScale(i))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("opacity", 0.8);

        tooltip
          .transition()
          .duration(200)
          .style("opacity", 1);
        
        tooltip
          .html(`
            <strong>${d.country}</strong><br/>
            CO₂ Emissions: ${d.co2_emissions.toLocaleString()} Mt<br/>
            Population: ${d.population.toLocaleString()}M<br/>
            GDP per capita: $${d.gdp_per_capita.toLocaleString()}
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("opacity", 1);

        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0);
      })
      .transition()
      .duration(800)
      .delay((d, i) => i * 50)
      .attr("y", d => yScale(d.co2_emissions))
      .attr("height", d => height - yScale(d.co2_emissions));

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")
      .style("font-size", "12px");

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .style("font-size", "12px");

    // Y Axis Label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#666")
      .text("CO₂ Emissions (Million Tonnes)");

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

export default BarChartVisualization;
