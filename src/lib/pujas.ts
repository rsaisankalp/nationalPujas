import type { Puja } from './types';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/1xU4M79f59nXjrIRl50-Ars22fI9K2OZf4RfEFjgS590/export?format=csv';

function parseCSV(csv: string): string[][] {
    const lines = csv.trim().split('\n');
    return lines.map(line => {
        const values: string[] = [];
        // Regex to handle quoted fields, commas within quotes, and escaped quotes
        const regex = /(?:"([^"]*(?:""[^"]*)*)"|([^,]*))(?:,|$)/g;
        let match;
        // Strip trailing comma from line
        const cleanLine = line.trim().endsWith(',') ? line.trim().slice(0, -1) : line.trim();

        while ((match = regex.exec(cleanLine)) && match[0] !== '') {
            // If it's a quoted field, use group 1, otherwise use group 2.
            // Unescape double quotes.
            const value = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
            values.push(value.trim());
            if (regex.lastIndex === cleanLine.length) break;
        }
        return values;
    });
}

export async function fetchPujas(): Promise<Puja[]> {
  try {
    const response = await fetch(CSV_URL, {
      next: { revalidate: 600 }, // Revalidate every 10 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch puja data: ${response.statusText}`);
    }

    const csvText = await response.text();
    const parsed = parseCSV(csvText);

    // First row is headers
    const headers = parsed[0]; 
    const pujas: Puja[] = parsed.slice(1).map(row => {
      // Basic validation
      if (row.length < headers.length || !row[0]) return null;

      return {
        id: row[0],
        eventName: row[1],
        subPurpose: row[2],
        date: row[3],
        time: row[4],
        venue: row[5],
        city: row[6],
        district: row[7],
        state: row[8],
        locationIdentifier: row[9],
        mapLocation: row[10],
        latlong: row[11],
        registrationLink: row[12],
      };
    }).filter((p): p is Puja => p !== null);
    
    return pujas;
  } catch (error) {
    console.error("Error fetching or parsing pujas:", error);
    return [];
  }
}
