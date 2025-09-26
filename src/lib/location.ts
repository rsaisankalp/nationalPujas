import { headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import type { UserLocation } from './types';

// Function to get user IP
export function getIP(request?: NextRequest) {
  const headersList = headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = headersList.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  if (request?.ip) {
      return request.ip;
  }
  // For local development, use a loopback address
  return '127.0.0.1'; 
}

const geoAPIs = [
  async (ip: string): Promise<UserLocation | null> => {
    try {
      const response = await fetch(`http://ipwho.is/${ip}`, { next: { revalidate: 3600 } });
      if (!response.ok) return null;
      const data = await response.json();
      if (data?.success && data.latitude && data.longitude) {
        return { latitude: data.latitude, longitude: data.longitude };
      }
      return null;
    } catch (error) {
      console.error('ipwho.is API failed:', error);
      return null;
    }
  },
  async (ip: string): Promise<UserLocation | null> => {
    try {
      // Note: This is a public access key and may be subject to rate limits.
      const accessKey = 'f6234f6e59e260e944f71e7e0661056b';
      const response = await fetch(`https://api.ipapi.com/api/${ip}?access_key=${accessKey}`, { next: { revalidate: 3600 } });
      if (!response.ok) return null;
      const data = await response.json();
      if (data?.latitude && data?.longitude) {
        return { latitude: data.latitude, longitude: data.longitude };
      }
      return null;
    } catch (error) {
      console.error('ipapi.com API failed:', error);
      return null;
    }
  },
];

// NOTE: The following is a stateful round-robin implementation. In a serverless
// environment, the state of 'lastUsedApiIndex' is not guaranteed to be preserved
// across function invocations. This may result in the round-robin restarting
// from the beginning for each new request, defeating the purpose of load balancing.
// A random selection is often a more practical approach in such environments.
let lastUsedApiIndex = -1;

export async function getLocationFromIP(ip: string): Promise<UserLocation | null> {
  if (geoAPIs.length === 0) {
    console.warn("No geolocation APIs configured. Using fallback location.");
    return { latitude: 20.5937, longitude: 78.9629 };
  }

  lastUsedApiIndex = (lastUsedApiIndex + 1) % geoAPIs.length;
  const selectedApi = geoAPIs[lastUsedApiIndex];

  const location = await selectedApi(ip);
  if (location) {
    return location;
  }

  // Fallback location if the API fails
  console.warn(`Geolocation API at index ${lastUsedApiIndex} failed. Using fallback location.`);
  return { latitude: 20.5937, longitude: 78.9629 };
}


// Haversine formula to calculate distance
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}
