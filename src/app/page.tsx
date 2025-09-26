import { headers } from 'next/headers';
import { getIP, getLocationFromIP, calculateDistance } from '@/lib/location';
import { fetchPujas } from '@/lib/pujas';
import type { LocationInfo } from '@/lib/types';
import PujaListClient from '@/components/pujas/PujaListClient';

export const revalidate = 600; // 10 minutes

export default async function Home() {
  const ip = getIP();
  const userLocation = await getLocationFromIP(ip);
  const allPujas = await fetchPujas();
  
  if (!allPujas || allPujas.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h1 className="font-headline text-4xl text-primary">Vaidic Pujas Discovery</h1>
          <p className="mt-4 text-lg text-muted-foreground">Could not load puja information at this time.</p>
          <p className="text-sm text-muted-foreground">Please try again later.</p>
        </div>
      </main>
    )
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

  return (
    <PujaListClient
      pujas={allPujas}
      locations={locationsWithDistance}
      initialLocation={nearestLocationName}
    />
  );
}
