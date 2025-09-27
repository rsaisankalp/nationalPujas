'use client';

import { useEffect, useState } from 'react';
import type { UserLocation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface LocationPermissionProps {
  setStatus: (status: PermissionState | 'prompt' | 'loading') => void;
  setCoords: (coords: UserLocation | null) => void;
}

export function LocationPermission({ setStatus, setCoords }: LocationPermissionProps) {
  const [showDeniedMessage, setShowDeniedMessage] = useState(false);
  const [retries, setRetries] = useState(0);
  const MAX_RETRIES = 1;

  const handlePermission = () => {
    if (!navigator.geolocation) {
      // Geolocation not supported, fallback to IP
      setStatus('denied');
      setCoords(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus('granted');
      },
      (error) => {
        // Error
        console.warn(`Geolocation error: ${error.message}`);
        setShowDeniedMessage(true);
        if (retries < MAX_RETRIES) {
          setRetries(prev => prev + 1);
          // Stay on 'prompt' status to allow another try
        } else {
          // Max retries reached, fallback to IP
          setStatus('denied');
          setCoords(null);
        }
      }
    );
  };
  
  // Initial check on component mount
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
        if (permissionStatus.state === 'granted') {
          handlePermission();
        } else if (permissionStatus.state === 'prompt') {
            setStatus('prompt');
        } else if (permissionStatus.state === 'denied') {
            setShowDeniedMessage(true);
            if (retries >= MAX_RETRIES) {
                setStatus('denied');
                setCoords(null);
            } else {
                setStatus('prompt');
            }
        }
        permissionStatus.onchange = () => {
            setStatus(permissionStatus.state);
            if(permissionStatus.state === 'granted') handlePermission();
        };
      });
    } else {
        // Fallback for older browsers
        setStatus('prompt');
    }
  }, []);

  const useIPLocation = () => {
    setStatus('denied');
    setCoords(null);
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">Find Pujas Near You</CardTitle>
          <CardDescription className="text-muted-foreground">
            To provide the best experience, we need your permission to access your location.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {showDeniedMessage && (
                 <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Location Access Denied</AlertTitle>
                  <AlertDescription>
                    You've blocked location access. To find pujas nearest to you, please enable location permissions in your browser settings.
                  </AlertDescription>
                </Alert>
            )}

          <Button onClick={handlePermission} className="w-full font-bold" size="lg">
            Allow Location Access
          </Button>
          <Button onClick={useIPLocation} variant="outline" className="w-full">
            Continue without precise location
          </Button>

           <div className="flex items-start gap-2 rounded-md border bg-muted/50 p-3 text-left text-xs text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                    <span className="font-semibold">How we use your location:</span> We only use your location once to find the nearest puja centers. We do not store or share your location data. If you continue without sharing, we'll use a less accurate IP-based location.
                </div>
            </div>

        </CardContent>
      </Card>
    </main>
  );
}
