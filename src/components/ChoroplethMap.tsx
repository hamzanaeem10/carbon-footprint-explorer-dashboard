
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { EmissionData } from '@/utils/dataGenerator';

interface ChoroplethMapProps {
  data: EmissionData[];
  selectedYear: number;
}

const ChoroplethMap: React.FC<ChoroplethMapProps> = ({ data, selectedYear }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    svg.attr("width", width).attr("height", height);

    // Filter data for selected year
    const yearData = data.filter(d => d.year === selectedYear);
    
    // Create a map of country to CO2 emissions
    const emissionsByCountry = new Map();
    yearData.forEach(d => {
      emissionsByCountry.set(d.country, d.co2_emissions);
    });

    // Color scale
    const maxEmission = d3.max(yearData, d => d.co2_emissions) || 0;
    const colorScale = d3.scaleSequential(d3.interpolateReds)
      .domain([0, maxEmission]);

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none");

    // Load world map data (using a simple world map)
    const fetchWorldData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
        const worldData = await response.json();

        const projection = d3.geoNaturalEarth1()
          .scale(130)
          .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        // Draw countries
        svg.selectAll("path")
          .data(worldData.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", (d: any) => {
            const countryName = d.properties.NAME;
            const emission = emissionsByCountry.get(countryName);
            return emission ? colorScale(emission) : "#f0f0f0";
          })
          .attr("stroke", "#333")
          .attr("stroke-width", 0.5)
          .on("mouseover", function(event: any, d: any) {
            const countryName = d.properties.NAME;
            const emission = emissionsByCountry.get(countryName);
            
            tooltip.transition()
              .duration(200)
              .style("opacity", .9);
            tooltip.html(`
              <strong>${countryName}</strong><br/>
              CO₂ Emissions: ${emission ? emission.toFixed(2) : 'No data'} Mt<br/>
              Year: ${selectedYear}
            `)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", function() {
            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
          });

        // Add legend
        const legendWidth = 300;
        const legendHeight = 10;
        const legendX = width - legendWidth - 40;
        const legendY = height - 40;

        const legendScale = d3.scaleLinear()
          .domain([0, maxEmission])
          .range([0, legendWidth]);

        const legendAxis = d3.axisBottom(legendScale)
          .ticks(5)
          .tickFormat(d => `${d}Mt`);

        // Legend gradient
        const defs = svg.append("defs");
        const gradient = defs.append("linearGradient")
          .attr("id", "legend-gradient");

        gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", colorScale(0));

        gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", colorScale(maxEmission));

        svg.append("rect")
          .attr("x", legendX)
          .attr("y", legendY)
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .style("fill", "url(#legend-gradient)");

        svg.append("g")
          .attr("transform", `translate(${legendX}, ${legendY + legendHeight})`)
          .call(legendAxis);

        svg.append("text")
          .attr("x", legendX + legendWidth / 2)
          .attr("y", legendY - 5)
          .attr("text-anchor", "middle")
          .style("font-size", "12px")
          .text("CO₂ Emissions (Million Tonnes)");

      } catch (error) {
        console.error('Error loading world map data:', error);
        
        // Fallback: create a simple chart showing top countries
        const topCountries = yearData
          .sort((a, b) => b.co2_emissions - a.co2_emissions)
          .slice(0, 15);

        const y = d3.scaleBand()
          .domain(topCountries.map(d => d.country))
          .range([margin.top, height - margin.bottom])
          .padding(0.1);

        const x = d3.scaleLinear()
          .domain([0, d3.max(topCountries, d => d.co2_emissions) || 0])
          .range([margin.left, width - margin.right]);

        svg.selectAll("rect")
          .data(topCountries)
          .enter()
          .append("rect")
          .attr("x", margin.left)
          .attr("y", d => y(d.country) || 0)
          .attr("width", d => x(d.co2_emissions) - margin.left)
          .attr("height", y.bandwidth())
          .attr("fill", d => colorScale(d.co2_emissions));

        svg.selectAll("text")
          .data(topCountries)
          .enter()
          .append("text")
          .attr("x", margin.left - 5)
          .attr("y", d => (y(d.country) || 0) + y.bandwidth() / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "end")
          .style("font-size", "10px")
          .text(d => d.country);

        svg.append("text")
          .attr("x", width / 2)
          .attr("y", margin.top / 2)
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .style("font-weight", "bold")
          .text("Top CO₂ Emitting Countries (Map data unavailable)");
      }
    };

    fetchWorldData();

    // Cleanup tooltip on unmount
    return () => {
      d3.select("body").selectAll(".tooltip").remove();
    };

  }, [data, selectedYear]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg ref={svgRef} className="max-w-full h-auto"></svg>
    </div>
  );
};

export default ChoroplethMap;
