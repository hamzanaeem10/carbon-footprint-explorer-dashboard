
export interface EmissionData {
  country: string;
  year: number;
  co2_emissions: number; // Million tonnes
  population: number;    // Millions
  gdp_per_capita: number; // USD
}

const countries = [
  'China', 'United States', 'India', 'Russia', 'Japan', 'Germany', 'Iran', 'South Korea',
  'Saudi Arabia', 'Indonesia', 'Canada', 'Mexico', 'Brazil', 'South Africa', 'Turkey',
  'Australia', 'United Kingdom', 'Poland', 'Italy', 'France', 'Ukraine', 'Spain',
  'Thailand', 'Egypt', 'Malaysia', 'Argentina', 'Netherlands', 'Kazakhstan', 'Pakistan',
  'Vietnam'
];

// Base data for realistic scaling - approximate 2020 values
const baseCountryData: Record<string, { co2: number; pop: number; gdp: number }> = {
  'China': { co2: 10175, pop: 1439, gdp: 10500 },
  'United States': { co2: 4713, pop: 331, gdp: 63500 },
  'India': { co2: 2442, pop: 1380, gdp: 1900 },
  'Russia': { co2: 1577, pop: 146, gdp: 11600 },
  'Japan': { co2: 1061, pop: 126, gdp: 40100 },
  'Germany': { co2: 644, pop: 83, gdp: 46500 },
  'Iran': { co2: 633, pop: 84, gdp: 2900 },
  'South Korea': { co2: 571, pop: 52, gdp: 31800 },
  'Saudi Arabia': { co2: 517, pop: 35, gdp: 23000 },
  'Indonesia': { co2: 486, pop: 274, gdp: 3900 },
  'Canada': { co2: 481, pop: 38, gdp: 46300 },
  'Mexico': { co2: 441, pop: 129, gdp: 9700 },
  'Brazil': { co2: 419, pop: 213, gdp: 7500 },
  'South Africa': { co2: 390, pop: 60, gdp: 6000 },
  'Turkey': { co2: 353, pop: 85, gdp: 9100 },
  'Australia': { co2: 348, pop: 26, gdp: 55100 },
  'United Kingdom': { co2: 326, pop: 67, gdp: 42300 },
  'Poland': { co2: 282, pop: 38, gdp: 15200 },
  'Italy': { co2: 254, pop: 60, gdp: 31300 },
  'France': { co2: 249, pop: 68, gdp: 39000 },
  'Ukraine': { co2: 185, pop: 44, gdp: 3700 },
  'Spain': { co2: 184, pop: 47, gdp: 27000 },
  'Thailand': { co2: 183, pop: 70, gdp: 7200 },
  'Egypt': { co2: 181, pop: 103, gdp: 3000 },
  'Malaysia': { co2: 178, pop: 33, gdp: 11200 },
  'Argentina': { co2: 153, pop: 45, gdp: 8900 },
  'Netherlands': { co2: 153, pop: 17, gdp: 52300 },
  'Kazakhstan': { co2: 142, pop: 19, gdp: 9100 },
  'Pakistan': { co2: 138, pop: 225, gdp: 1300 },
  'Vietnam': { co2: 136, pop: 98, gdp: 2800 }
};

export const generateSampleData = (): EmissionData[] => {
  const data: EmissionData[] = [];
  const years = Array.from({ length: 33 }, (_, i) => 1990 + i); // 1990-2022

  countries.forEach(country => {
    const baseData = baseCountryData[country] || { co2: 100, pop: 50, gdp: 5000 };
    
    years.forEach((year, yearIndex) => {
      // Create realistic trends over time
      const timeProgress = yearIndex / (years.length - 1);
      
      // CO2 emissions: generally increasing with some variation
      const co2Growth = country === 'China' ? 
        Math.pow(timeProgress, 0.8) * 2.5 + 0.3 : // China's rapid growth
        country === 'United States' ? 
        0.8 + timeProgress * 0.4 + Math.sin(timeProgress * Math.PI) * 0.1 : // US more stable
        0.6 + timeProgress * 0.8 + Math.random() * 0.3; // Others varied growth
      
      const co2_emissions = Math.round(baseData.co2 * co2Growth * (0.8 + Math.random() * 0.4));
      
      // Population: steady growth
      const popGrowth = 0.7 + timeProgress * 0.4 + Math.random() * 0.1;
      const population = Math.round(baseData.pop * popGrowth);
      
      // GDP per capita: generally increasing
      const gdpGrowth = 0.5 + timeProgress * 0.8 + Math.random() * 0.2;
      const gdp_per_capita = Math.round(baseData.gdp * gdpGrowth);
      
      data.push({
        country,
        year,
        co2_emissions: Math.max(1, co2_emissions),
        population: Math.max(1, population),
        gdp_per_capita: Math.max(500, gdp_per_capita)
      });
    });
  });

  return data;
};
