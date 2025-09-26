'use client';

import { useState, useEffect } from 'react';
import type { Puja, LocationInfo, UserLocation } from '@/lib/types';
import PujaListClient from '@/components/pujas/PujaListClient';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 p-4 md:p-6">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-8 w-1/3 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [initialLocation, setInitialLocation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/pujas');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        
        if (!data.pujas || data.pujas.length === 0) {
           setError('Could not load puja information at this time.');
           setPujas([]);
        } else {
           setPujas(data.pujas);
        }

        setLocations(data.locationsWithDistance);
        setInitialLocation(data.nearestLocationName);
        setError(null);
      } catch (e: any) {
        console.error(e);
        setError(e.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
       <main className="container mx-auto px-4 py-8">
        <LoadingSkeleton />
       </main>
    )
  }

  if (error) {
     return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h1 className="font-headline text-4xl text-primary">Vaidic Pujas Discovery</h1>
          <p className="mt-4 text-lg text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">Please try again later.</p>
        </div>
      </main>
    )
  }

  return (
    <PujaListClient
      pujas={pujas}
      locations={locations}
      initialLocation={initialLocation}
    />
  );
}
