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
  // For local development, use a public IP
  return '8.8.8.8'; 
}

const geoAPIs = [
  async (ip: string): Promise<UserLocation | null> => {
    try {
      const response = await fetch(`https://tools.keycdn.com/geo.json?host=${ip}`, {
        headers: { 'User-Agent': 'keycdn-tools:https://register.vaidicpujas.in' },
        next: { revalidate: 3600 } // Cache for an hour
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data?.status === 'success' && data.data?.geo?.latitude && data.data?.geo?.longitude) {
        return { latitude: parseFloat(data.data.geo.latitude), longitude: parseFloat(data.data.geo.longitude) };
      }
      return null;
    } catch (error) {
      console.error('KeyCDN Geo API failed:', error);
      return null;
    }
  },
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

export async function getLocationFromIP(ip: string): Promise<UserLocation | null> {
  for (const api of geoAPIs) {
    const location = await api(ip);
    if (location) {
      return location;
    }
  }
  // Fallback location if all APIs fail (e.g., center of India)
  console.warn("All geolocation APIs failed. Using fallback location.");
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
