import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Scatter, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BarChartVisualization from '@/components/BarChartVisualization';
import LineChartVisualization from '@/components/LineChartVisualization';
import ScatterPlotVisualization from '@/components/ScatterPlotVisualization';
import { generateSampleData, EmissionData } from '@/utils/dataGenerator';

const Index = () => {
  const [data, setData] = useState<EmissionData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2020);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['United States', 'China', 'India', 'Russia']);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      const sampleData = generateSampleData();
      setData(sampleData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => b - a);
  const countries = Array.from(new Set(data.map(d => d.country))).sort();

  const handleExportData = () => {
    const filteredData = data.filter(d => 
      d.year === selectedYear || selectedCountries.includes(d.country)
    );
    
    const csvContent = [
      'Country,Year,CO2_Emissions,Population,GDP_Per_Capita',
      ...filteredData.map(d => 
        `${d.country},${d.year},${d.co2_emissions},${d.population},${d.gdp_per_capita}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `co2_emissions_${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading CO₂ emissions data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Carbon Footprint Explorer</h1>
                <p className="text-sm text-gray-600">Global CO₂ Emissions Dashboard (1990-2022)</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                {data.length.toLocaleString()} data points
              </Badge>
              <Button onClick={handleExportData} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Controls */}
        <Card className="mb-8 bg-white/90 backdrop-blur-sm border-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-emerald-600" />
              <span>Filters & Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Year for Bar Chart
                </label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Countries for Trends
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedCountries.map(country => (
                    <Badge key={country} variant="secondary" className="bg-blue-100 text-blue-700">
                      {country}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visualizations */}
        <Tabs defaultValue="bar" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-white/90 backdrop-blur-sm">
            <TabsTrigger value="bar" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Bar Chart</span>
            </TabsTrigger>
            <TabsTrigger value="line" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Trends</span>
            </TabsTrigger>
            <TabsTrigger value="scatter" className="flex items-center space-x-2">
              <Scatter className="w-4 h-4" />
              <span className="hidden sm:inline">Scatter</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bar">
            <Card className="bg-white/90 backdrop-blur-sm border-emerald-100">
              <CardHeader>
                <CardTitle>Top CO₂ Emitting Countries in {selectedYear}</CardTitle>
                <p className="text-sm text-gray-600">
                  Annual CO₂ emissions measured in million tonnes. Hover for detailed information.
                </p>
              </CardHeader>
              <CardContent>
                <BarChartVisualization data={data} selectedYear={selectedYear} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="line">
            <Card className="bg-white/90 backdrop-blur-sm border-emerald-100">
              <CardHeader>
                <CardTitle>CO₂ Emission Trends Over Time</CardTitle>
                <p className="text-sm text-gray-600">
                  Historical trends for selected countries. Use mouse wheel to zoom, drag to pan.
                </p>
              </CardHeader>
              <CardContent>
                <LineChartVisualization data={data} selectedCountries={selectedCountries} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scatter">
            <Card className="bg-white/90 backdrop-blur-sm border-emerald-100">
              <CardHeader>
                <CardTitle>CO₂ Emissions vs GDP per Capita ({selectedYear})</CardTitle>
                <p className="text-sm text-gray-600">
                  Bubble size represents population. Explore the relationship between economic development and emissions.
                </p>
              </CardHeader>
              <CardContent>
                <ScatterPlotVisualization data={data} selectedYear={selectedYear} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Data visualization powered by D3.js • Sample dataset for demonstration purposes</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
