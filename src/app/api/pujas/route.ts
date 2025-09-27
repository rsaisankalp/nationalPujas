import { NextResponse, type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { getIP, getLocationFromIP, calculateDistance } from '@/lib/location';
import { fetchPujas } from '@/lib/pujas';
import type { LocationInfo, UserLocation } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 600; // 10 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get('lat');
    const lonParam = searchParams.get('lon');

    let userLocation: UserLocation | null = null;

    if (latParam && lonParam) {
        const lat = parseFloat(latParam);
        const lon = parseFloat(lonParam);
        if (!isNaN(lat) && !isNaN(lon)) {
            console.log("Using GPS coordinates from query params:", { lat, lon });
            userLocation = { latitude: lat, longitude: lon };
        }
    }

    if (!userLocation) {
        const ip = getIP(request);
        console.log("User IP:", ip);
        userLocation = await getLocationFromIP(ip);
        console.log("User Location from IP:", userLocation);
    }
    
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
        let [lat, lng] = puja.latlong.split(',').map(s => parseFloat(s.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          // Heuristic to fix swapped lat/lng for locations in India
          if (lat > lng) {
            [lat, lng] = [lng, lat]; // Swap them
          }
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
