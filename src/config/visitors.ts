/**
 * Sample data for the Global Reach map, shown only while `SITE.visitorApi` is
 * empty (e.g. before the Cloudflare Worker in `visitor-api/` is deployed). It has
 * the same shape as the Worker's response. Once the API is connected, this file
 * is unused.
 */
export interface CityStat {
  city: string;
  country: string;
  lat: number;
  lon: number;
  visits: number;
}

export interface VisitorData {
  since: string | null; // ISO date of the first recorded visit
  cities: CityStat[];
}

export const VISITORS: VisitorData = {
  since: '2026-09-24',
  cities: [
    { city: 'Seattle', country: 'United States', lat: 47.61, lon: -122.33, visits: 34 },
    { city: 'Santa Clara', country: 'United States', lat: 37.35, lon: -121.96, visits: 28 },
    { city: 'San Francisco', country: 'United States', lat: 37.77, lon: -122.42, visits: 14 },
    { city: 'Los Angeles', country: 'United States', lat: 34.05, lon: -118.24, visits: 9 },
    { city: 'New York', country: 'United States', lat: 40.71, lon: -74.01, visits: 16 },
    { city: 'Boston', country: 'United States', lat: 42.36, lon: -71.06, visits: 11 },
    { city: 'Pittsburgh', country: 'United States', lat: 40.44, lon: -79.99, visits: 7 },
    { city: 'Chicago', country: 'United States', lat: 41.88, lon: -87.63, visits: 8 },
    { city: 'Austin', country: 'United States', lat: 30.27, lon: -97.74, visits: 6 },
    { city: 'Atlanta', country: 'United States', lat: 33.75, lon: -84.39, visits: 3 },
    { city: 'Vancouver', country: 'Canada', lat: 49.28, lon: -123.12, visits: 5 },
    { city: 'Montreal', country: 'Canada', lat: 45.5, lon: -73.57, visits: 4 },
    { city: 'London', country: 'United Kingdom', lat: 51.51, lon: -0.13, visits: 6 },
    { city: 'Paris', country: 'France', lat: 48.86, lon: 2.35, visits: 3 },
    { city: 'Munich', country: 'Germany', lat: 48.14, lon: 11.58, visits: 3 },
    { city: 'Shanghai', country: 'China', lat: 31.23, lon: 121.47, visits: 12 },
    { city: 'Beijing', country: 'China', lat: 39.9, lon: 116.41, visits: 9 },
    { city: 'Hong Kong', country: 'Hong Kong', lat: 22.32, lon: 114.17, visits: 6 },
    { city: 'Tokyo', country: 'Japan', lat: 35.68, lon: 139.69, visits: 5 },
    { city: 'Seoul', country: 'South Korea', lat: 37.57, lon: 126.98, visits: 3 },
    { city: 'Singapore', country: 'Singapore', lat: 1.35, lon: 103.82, visits: 4 },
    { city: 'Bengaluru', country: 'India', lat: 12.97, lon: 77.59, visits: 3 },
  ],
};
