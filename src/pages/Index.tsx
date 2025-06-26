
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Activity, Filter, Download, MapPin, Globe, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BarChartVisualization from '@/components/BarChartVisualization';
import LineChartVisualization from '@/components/LineChartVisualization';
import ScatterPlotVisualization from '@/components/ScatterPlotVisualization';
import ChoroplethMap from '@/components/ChoroplethMap';
import { fetchRealCO2Data, EmissionData } from '@/utils/dataGenerator';

const Index = () => {
  const [data, setData] = useState<EmissionData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2020);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['United States', 'China', 'India', 'Russia']);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log('Loading CO₂ emissions data...');
        const co2Data = await fetchRealCO2Data();
        setData(co2Data);
        setDataSource('Our World in Data');
        
        // Update selected countries based on actual data
        const availableCountries = [...new Set(co2Data.map(d => d.country))];
        const topCountries = co2Data
          .filter(d => d.year === 2020)
          .sort((a, b) => b.co2_emissions - a.co2_emissions)
          .slice(0, 4)
          .map(d => d.country);
        
        setSelectedCountries(topCountries.length > 0 ? topCountries : availableCountries.slice(0, 4));
        
        console.log(`Loaded ${co2Data.length} data points from ${dataSource}`);
      } catch (error) {
        console.error('Error loading data:', error);
        setDataSource('Sample Data (Fallback)');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => b - a);
  const countries = Array.from(new Set(data.map(d => d.country))).sort();

  const handleExportData = () => {
    const filteredData = data.filter(d => 
      d.year === selectedYear || selectedCountries.includes(d.country)
    );
    
    const csvContent = [
      'Country,Year,CO2_Emissions,Population,GDP_Per_Capita,CO2_Per_Capita',
      ...filteredData.map(d => 
        `${d.country},${d.year},${d.co2_emissions},${d.population},${d.gdp_per_capita},${d.co2_per_capita}`
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-blue-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-emerald-400 border-r-blue-400 mx-auto"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-emerald-300 opacity-20 mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Climate Data</h2>
          <p className="text-emerald-200 mb-1">Fetching real CO₂ emissions data from Our World in Data...</p>
          <p className="text-blue-200 text-sm">Analyzing global climate patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-blue-900 relative">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Globe className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Carbon <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Footprint</span> Explorer
                </h1>
                <p className="text-emerald-200 text-sm font-medium">Real Global CO₂ Emissions • {dataSource}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2 font-semibold">
                <Zap className="w-4 h-4 mr-2" />
                {data.length.toLocaleString()} data points
              </Badge>
              <Button 
                onClick={handleExportData} 
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white border-0 shadow-lg"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Controls */}
        <Card className="mb-8 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                <Filter className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl">Filters & Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-emerald-200 mb-3">
                  <Target className="w-4 h-4 inline mr-2" />
                  Select Year for Analysis
                </label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="bg-white/10 border-white/30 text-white">
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
                <label className="block text-sm font-semibold text-blue-200 mb-3">
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Selected Countries for Trends
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedCountries.map(country => (
                    <Badge key={country} className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-200 border-blue-300/30 px-3 py-1">
                      {country}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visualizations */}
        <Tabs defaultValue="bar" className="space-y-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-white/10 backdrop-blur-xl border-white/20 p-2">
            <TabsTrigger value="bar" className="flex items-center space-x-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Rankings</span>
            </TabsTrigger>
            <TabsTrigger value="line" className="flex items-center space-x-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Trends</span>
            </TabsTrigger>
            <TabsTrigger value="scatter" className="flex items-center space-x-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Scatter</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center space-x-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Global Map</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bar">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-bold">Top CO₂ Emitting Countries in {selectedYear}</CardTitle>
                <p className="text-emerald-200">
                  Annual CO₂ emissions from fossil fuels and industry (million tonnes). Data sourced from Our World in Data.
                </p>
              </CardHeader>
              <CardContent>
                <BarChartVisualization data={data} selectedYear={selectedYear} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="line">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-bold">CO₂ Emission Trends Over Time</CardTitle>
                <p className="text-blue-200">
                  Historical CO₂ emissions trends for selected countries. Use mouse wheel to zoom and drag to pan.
                </p>
              </CardHeader>
              <CardContent>
                <LineChartVisualization data={data} selectedCountries={selectedCountries} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scatter">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-bold">CO₂ Emissions vs GDP per Capita ({selectedYear})</CardTitle>
                <p className="text-purple-200">
                  Bubble size represents population. Explore the relationship between economic development and emissions.
                </p>
              </CardHeader>
              <CardContent>
                <ScatterPlotVisualization data={data} selectedYear={selectedYear} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-bold">Global CO₂ Emissions Choropleth Map ({selectedYear})</CardTitle>
                <p className="text-cyan-200">
                  Countries are color-coded by their CO₂ emission levels. Hover over countries for detailed information.
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-96 rounded-lg overflow-hidden">
                  <ChoroplethMap data={data} selectedYear={selectedYear} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <div className="text-center">
              <p className="text-white/80 font-medium">Data visualization powered by D3.js</p>
              <p className="text-emerald-300 text-sm mt-1">
                Real CO₂ data from{' '}
                <a 
                  href="https://github.com/owid/co2-data" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline font-semibold transition-colors"
                >
                  Our World in Data GitHub repository
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
