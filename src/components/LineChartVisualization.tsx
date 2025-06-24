
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { EmissionData } from '@/utils/dataGenerator';

interface LineChartProps {
  data: EmissionData[];
  selectedCountries: string[];
}

const LineChartVisualization: React.FC<LineChartProps> = ({ data, selectedCountries }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Filter data for selected countries
    const filteredData = data.filter(d => selectedCountries.includes(d.country));
    
    // Group data by country
    const groupedData = d3.group(filteredData, d => d.country);

    const margin = { top: 20, right: 120, bottom: 50, left: 80 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.bottom - margin.top;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(filteredData, d => d.year) as [number, number])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(filteredData, d => d.co2_emissions) || 0])
      .range([height, 0]);

    // Color scale
    const colorScale = d3
      .scaleOrdinal()
      .domain(selectedCountries)
      .range(d3.schemeCategory10);

    // Line generator
    const line = d3
      .line<EmissionData>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.co2_emissions))
      .curve(d3.curveMonotoneX);

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

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGGElement, unknown>()
      .scaleExtent([0.5, 10])
      .on("zoom", function(event) {
        const { transform } = event;
        
        const newXScale = transform.rescaleX(xScale);
        const newYScale = transform.rescaleY(yScale);
        
        // Update axes
        g.select(".x-axis")
          .call(d3.axisBottom(newXScale).tickFormat(d3.format("d")));
        
        g.select(".y-axis")
          .call(d3.axisLeft(newYScale));
        
        // Update lines
        const newLine = d3
          .line<EmissionData>()
          .x(d => newXScale(d.year))
          .y(d => newYScale(d.co2_emissions))
          .curve(d3.curveMonotoneX);
        
        g.selectAll(".line")
          .attr("d", d => newLine(d[1]));
        
        // Update circles
        g.selectAll(".dot")
          .attr("cx", d => newXScale((d as EmissionData).year))
          .attr("cy", d => newYScale((d as EmissionData).co2_emissions));
      });

    g.call(zoom);

    // Draw lines
    groupedData.forEach((countryData, country) => {
      const sortedData = countryData.sort((a, b) => a.year - b.year);
      
      g.append("path")
        .datum(sortedData)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", colorScale(country) as string)
        .attr("stroke-width", 2.5)
        .attr("d", line)
        .style("opacity", 0)
        .transition()
        .duration(1000)
        .style("opacity", 1);

      // Add dots
      g.selectAll(`.dot-${country.replace(/\s+/g, '')}`)
        .data(sortedData)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.co2_emissions))
        .attr("r", 0)
        .attr("fill", colorScale(country) as string)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .on("mouseover", function(event, d) {
          d3.select(this)
            .transition()
            .duration(100)
            .attr("r", 6);

          tooltip
            .transition()
            .duration(200)
            .style("opacity", 1);
          
          tooltip
            .html(`
              <strong>${d.country}</strong><br/>
              Year: ${d.year}<br/>
              CO₂ Emissions: ${d.co2_emissions.toLocaleString()} Mt<br/>
              Population: ${d.population.toLocaleString()}M
            `)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(100)
            .attr("r", 3);

          tooltip
            .transition()
            .duration(200)
            .style("opacity", 0);
        })
        .transition()
        .duration(1000)
        .delay((d, i) => i * 50)
        .attr("r", 3);
    });

    // X Axis
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
      .style("font-size", "12px");

    // Y Axis
    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale))
      .style("font-size", "12px");

    // Axis labels
    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + 40})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#666")
      .text("Year");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#666")
      .text("CO₂ Emissions (Million Tonnes)");

    // Legend
    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width + 20}, 20)`);

    selectedCountries.forEach((country, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow.append("rect")
        .attr("width", 15)
        .attr("height", 3)
        .attr("fill", colorScale(country) as string);

      legendRow.append("text")
        .attr("x", 20)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .style("fill", "#333")
        .text(country);
    });

    // Zoom instructions
    g.append("text")
      .attr("x", width - 10)
      .attr("y", height - 10)
      .style("text-anchor", "end")
      .style("font-size", "11px")
      .style("fill", "#999")
      .text("Mouse wheel: zoom • Drag: pan");

    // Cleanup tooltip on unmount
    return () => {
      d3.selectAll(".tooltip").remove();
    };
  }, [data, selectedCountries]);

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} className="w-full h-auto cursor-move"></svg>
    </div>
  );
};

export default LineChartVisualization;
