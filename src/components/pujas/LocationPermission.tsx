'use client';

import { useEffect, useState } from 'react';
import type { UserLocation, LocationInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';

interface LocationPermissionProps {
  setStatus: (status: PermissionState | 'prompt' | 'loading') => void;
  setCoords: (coords: UserLocation | null) => void;
  onManualSelect: (locationName: string) => void;
}

export function LocationPermission({ setStatus, setCoords, onManualSelect }: LocationPermissionProps) {
  const [internalState, setInternalState] = useState<'checking' | 'prompt' | 'denied'>('checking');
  const [retries, setRetries] = useState(0);
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const MAX_RETRIES = 1;

  useEffect(() => {
    // Fetch locations for the dropdown
    async function fetchLocations() {
      try {
        const response = await fetch('/api/pujas');
        if (response.ok) {
          const data = await response.json();
          setLocations(data.locationsWithDistance || []);
        }
      } catch (error) {
        console.error("Failed to fetch locations for dropdown", error);
      }
    }
    fetchLocations();

    const checkPermissions = async () => {
      if (typeof window !== 'undefined' && navigator.permissions) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
          
          if (permissionStatus.state === 'granted') {
             navigator.geolocation.getCurrentPosition((position) => {
                setCoords({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
                setStatus('granted');
              });
          } else if (permissionStatus.state === 'prompt') {
            setInternalState('prompt');
            setStatus('prompt');
          } else { // denied
            setInternalState('denied');
            setStatus('prompt');
          }

          permissionStatus.onchange = () => {
              if (permissionStatus.state === 'granted') {
                 navigator.geolocation.getCurrentPosition((position) => {
                    setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
                    setStatus('granted');
                });
              } else {
                 setInternalState('denied');
                 setStatus('prompt');
              }
          };

        } catch (error) {
           console.error("Error querying geolocation permission:", error);
           useIPLocation(); // Fallback on error
        }
      } else if (typeof window !== 'undefined' && navigator.geolocation) {
        setInternalState('prompt');
        setStatus('prompt');
      } else {
        useIPLocation(); // Fallback if no support
      }
    };
    checkPermissions();
  }, [setCoords, setStatus]);


  const handlePermissionRequest = () => {
    if (!navigator.geolocation) {
      useIPLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus('granted');
      },
      (error) => {
        console.warn(`Geolocation error: ${error.message}`);
        setInternalState('denied');
        if (retries < MAX_RETRIES) {
          setRetries(prev => prev + 1);
        } else {
          useIPLocation();
        }
      }
    );
  };

  const useIPLocation = () => {
    setCoords(null);
    setStatus('denied');
  };

  if (internalState === 'checking') {
     return (
         <Card className="w-full max-w-md text-center shadow-lg">
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
                <CardTitle className="font-headline text-2xl">Finding Pujas...</CardTitle>
                <CardDescription className="text-muted-foreground">
                    Please wait while we check your location settings.
                </CardDescription>
            </CardHeader>
         </Card>
     )
  }

  return (
    <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">Find Pujas Near You</CardTitle>
          <CardDescription className="text-muted-foreground">
            Allow location access for the best experience, or select a location manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {internalState === 'denied' && retries < MAX_RETRIES && (
                 <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Location Access Denied</AlertTitle>
                  <AlertDescription>
                    You've blocked location access. Please enable it or select a location manually.
                  </AlertDescription>
                </Alert>
            )}
             {internalState === 'denied' && retries >= MAX_RETRIES && (
                 <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Using Approximate Location</AlertTitle>
                  <AlertDescription>
                    For more accuracy, enable location permissions or select a location manually.
                  </AlertDescription>
                </Alert>
            )}

          <Button onClick={handlePermissionRequest} className="w-full font-bold" size="lg">
            Allow Location Access
          </Button>
          <Button onClick={useIPLocation} variant="outline" className="w-full">
            Use Approximate Location
          </Button>
          
          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          <Select onValueChange={onManualSelect}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a location manually..." />
            </SelectTrigger>
            <SelectContent>
                {locations.length > 0 ? (
                    locations.map(location => (
                        <SelectItem key={location.name} value={location.name}>
                            {location.name}
                        </SelectItem>
                    ))
                ) : (
                    <SelectItem value="loading" disabled>Loading locations...</SelectItem>
                )}
            </SelectContent>
           </Select>


           <div className="flex items-start gap-2 rounded-md border bg-muted/50 p-3 text-left text-xs text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                    <span className="font-semibold">How we use your location:</span> We only use your location to find nearby puja centers. We do not store or share this data.
                </div>
            </div>

        </CardContent>
      </Card>
  );
}
