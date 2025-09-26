import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getIP, getLocationFromIP, calculateDistance } from '@/lib/location';
import { fetchPujas } from '@/lib/pujas';
import type { LocationInfo } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 600; // 10 minutes

export async function GET() {
  try {
    const ip = getIP();
    console.log("User IP:", ip);
    const userLocation = await getLocationFromIP(ip);
    console.log("User Location:", userLocation);
    const allPujas = await fetchPujas();
    
    if (!allPujas || allPujas.length === 0) {
      return NextResponse.json({ 
        pujas: [], 
        locationsWithDistance: [],
        nearestLocationName: ''
      });
    }

    const uniqueLocationsMap = new Map<string, LocationInfo>();
    console.log("Processing Puja Locations:");
    allPujas.forEach(puja => {
      if (puja.locationIdentifier && puja.latlong && !uniqueLocationsMap.has(puja.locationIdentifier)) {
        console.log(`- ${puja.locationIdentifier}: Original latlong='${puja.latlong}'`);
        let [lat, lng] = puja.latlong.split(',').map(s => parseFloat(s.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          // Heuristic to fix swapped lat/lng for locations in India
          if (lat > lng) {
            console.log(`  Swapping lat/lng: [${lat}, ${lng}] -> [${lng}, ${lat}]`);
            [lat, lng] = [lng, lat]; // Swap them
          }
          uniqueLocationsMap.set(puja.locationIdentifier, {
            name: puja.locationIdentifier,
            lat,
            lng,
          });
          console.log(`  Parsed as: lat=${lat}, lng=${lng}`);
        } else {
          console.log(`  Failed to parse latlong.`);
        }
      }
    });

    const locationsWithDistance: LocationInfo[] = Array.from(uniqueLocationsMap.values()).map(loc => {
      const distance = userLocation ? calculateDistance(userLocation.latitude, userLocation.longitude, loc.lat, loc.lng) : undefined;
      console.log(`Distance to ${loc.name} (${loc.lat}, ${loc.lng}): ${distance} km`);
      return { ...loc, distance };
    });

    locationsWithDistance.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

    console.log("Sorted Locations by Distance:");
    locationsWithDistance.forEach(loc => {
      console.log(`- ${loc.name}: ${loc.distance} km`);
    });

    const nearestLocationName = locationsWithDistance.length > 0 ? locationsWithDistance[0].name : '';
    console.log("Nearest Location:", nearestLocationName);
    
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
