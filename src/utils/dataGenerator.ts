export interface EmissionData {
  country: string;
  year: number;
  co2_emissions: number; // co2 field from dataset
  population: number;
  gdp_per_capita: number; // calculated from gdp/population
  co2_per_capita: number; // co2_per_capita field from dataset
}

// Cache for the dataset
let cachedData: EmissionData[] | null = null;

export const fetchRealCO2Data = async (): Promise<EmissionData[]> => {
  if (cachedData) {
    return cachedData;
  }

  try {
    console.log('Fetching CO₂ data from Our World in Data...');
    
    // Fetch the CSV data from GitHub
    const response = await fetch('https://raw.githubusercontent.com/owid/co2-data/master/owid-co2-data.csv');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('CSV data fetched successfully');
    
    // Parse CSV data
    const rows = csvText.split('\n');
    const headers = rows[0].split(',').map(h => h.trim());
    
    console.log('CSV headers:', headers.slice(0, 10)); // Log first 10 headers
    
    const data: EmissionData[] = [];
    
    // Process each row (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row.trim()) continue; // Skip empty rows
      
      // Parse CSV row (handle commas in quoted fields)
      const values = parseCSVRow(row);
      
      if (values.length < headers.length) continue; // Skip malformed rows
      
      const rowData: { [key: string]: string } = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });
      
      // Extract required fields
      const country = rowData['country']?.trim();
      const year = parseInt(rowData['year']);
      const co2 = parseFloat(rowData['co2']);
      const population = parseFloat(rowData['population']);
      const gdp = parseFloat(rowData['gdp']);
      const co2_per_capita = parseFloat(rowData['co2_per_capita']);
      
      // Filter valid data points
      if (
        country && 
        !isNaN(year) && 
        !isNaN(co2) && 
        !isNaN(population) && 
        !isNaN(gdp) &&
        co2 > 0 && 
        population > 0 && 
        gdp > 0 &&
        year >= 1990 && 
        year <= 2022 &&
        country !== 'World' && // Exclude world totals
        !country.includes('income') // Exclude income group aggregates
      ) {
        data.push({
          country,
          year,
          co2_emissions: co2,
          population: population / 1000000, // Convert to millions
          gdp_per_capita: gdp / population,
          co2_per_capita: co2_per_capita || 0
        });
      }
    }
    
    console.log(`Processed ${data.length} valid data points`);
    console.log('Sample countries:', [...new Set(data.map(d => d.country))].slice(0, 10));
    
    cachedData = data;
    return data;
    
  } catch (error) {
    console.error('Error fetching real CO₂ data:', error);
    console.log('Falling back to generated sample data...');
    
    // Fallback to generated data if fetch fails
    return generateSampleData();
  }
};

// Helper function to parse CSV rows (handles quoted fields)
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Keep the original sample data generator as fallback
export const generateSampleData = (): EmissionData[] => {
  const countries = [
    'China', 'United States', 'India', 'Russia', 'Japan', 'Germany', 'Iran', 
    'South Korea', 'Saudi Arabia', 'Indonesia', 'Canada', 'Mexico', 'Brazil',
    'South Africa', 'Turkey', 'Australia', 'United Kingdom', 'Poland', 'Italy',
    'France', 'Ukraine', 'Thailand', 'Egypt', 'Pakistan', 'Argentina'
  ];
  
  const data: EmissionData[] = [];
  
  for (const country of countries) {
    for (let year = 1990; year <= 2022; year++) {
      // Generate realistic base values
      const baseEmissions = Math.random() * 10000 + 500;
      const growthRate = (Math.random() - 0.5) * 0.05;
      const yearFactor = Math.pow(1 + growthRate, year - 2000);
      
      data.push({
        country,
        year,
        co2_emissions: Math.max(50, baseEmissions * yearFactor + (Math.random() - 0.5) * 500),
        population: Math.random() * 1000 + 10,
        gdp_per_capita: Math.random() * 50000 + 5000,
        co2_per_capita: Math.random() * 20 + 1
      });
    }
  }
  
  return data;
};
