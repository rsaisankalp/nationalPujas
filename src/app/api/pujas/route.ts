import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getIP, getLocationFromIP, calculateDistance } from '@/lib/location';
import { fetchPujas } from '@/lib/pujas';
import type { LocationInfo } from '@/lib/types';

export const revalidate = 600; // 10 minutes

export async function GET() {
  try {
    const ip = getIP();
    const userLocation = await getLocationFromIP(ip);
    const allPujas = await fetchPujas();
    
    if (!allPujas || allPujas.length === 0) {
      return NextResponse.json({ 
        pujas: [], 
        locationsWithDistance: [],
        nearestLocationName: ''
      });
    }

    const uniqueLocationsMap = new Map<string, LocationInfo>();

    allPujas.forEach(puja => {
      if (puja.locationIdentifier && puja.latlong && !uniqueLocationsMap.has(puja.locationIdentifier)) {
        const [lat, lng] = puja.latlong.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          uniqueLocationsMap.set(puja.locationIdentifier, {
            name: puja.locationIdentifier,
            lat,
            lng,
          });
        }
      }
    });

    const locationsWithDistance: LocationInfo[] = Array.from(uniqueLocationsMap.values()).map(loc => {
      const distance = userLocation ? calculateDistance(userLocation.latitude, userLocation.longitude, loc.lat, loc.lng) : undefined;
      return { ...loc, distance };
    });

    locationsWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

    const nearestLocationName = locationsWithDistance.length > 0 ? locationsWithDistance[0].name : '';
    
    return NextResponse.json({
        pujas: allPujas,
        locationsWithDistance,
        nearestLocationName
    });

  } catch (error) {
    console.error('API Error fetching pujas:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
