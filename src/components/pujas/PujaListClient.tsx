'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import type { Puja, LocationInfo } from '@/lib/types';
import { PujaCard } from './PujaCard';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { MapPin, Tag, Phone, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import placeholderData from '@/lib/placeholder-images.json';
import { useIsMobile } from '@/hooks/use-mobile';


const { placeholderImages } = placeholderData;

function getVenueDetails(puja: Puja) {
  const venueDetails = [puja.venue, puja.city, puja.district, puja.state].filter(Boolean);
  return [...new Set(venueDetails)].join(', ');
}

function ContactDetails({ contactNo }: { contactNo?: string }) {
    const isMobile = useIsMobile();
    if (!contactNo) return null;

    const cleanContactNo = contactNo.replace(/\D/g, '');
    const whatsappLink = `https://wa.me/${cleanContactNo}`;
    const telLink = `tel:${cleanContactNo}`;

    return (
        <div className="text-muted-foreground">
            <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0 text-primary"/>
                <div className="flex items-center gap-4">
                     {isMobile ? (
                        <a href={telLink} className="hover:underline font-medium">{contactNo}</a>
                     ) : (
                        <span className="font-medium">{contactNo}</span>
                     )}
                     <Button variant="outline" size="sm" asChild>
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                            <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    )
}


export default function PujaListClient({ pujas, locations, initialLocation }: { pujas: Puja[], locations: LocationInfo[], initialLocation: string }) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  const filteredPujas = useMemo(() => {
    if (!selectedLocation) return pujas;
    return pujas.filter(puja => puja.locationIdentifier === selectedLocation);
  }, [pujas, selectedLocation]);
  
  const selectedLocationDetails = useMemo(() => {
    return pujas.find(p => p.locationIdentifier === selectedLocation);
  }, [pujas, selectedLocation]);

  const locationBanner = placeholderImages.find(p => p.id === 'location-banner');

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header
        locations={locations}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
      />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {selectedLocationDetails && (
            <div className="mb-8 rounded-xl bg-card/80 p-4 md:p-6 shadow-md border border-border">
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-center">
                    <div className="flex-1 space-y-3">
                         <h1 className="font-headline text-3xl text-accent">{selectedLocationDetails.locationIdentifier}</h1>
                         <div className="space-y-2 text-muted-foreground">
                            <p className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-primary"/> <span>{getVenueDetails(selectedLocationDetails)}</span></p>
                            <p className="flex items-center gap-2"><Tag className="w-4 h-4 text-primary"/> <span>{selectedLocationDetails.district}, {selectedLocationDetails.state}</span></p>
                            <ContactDetails contactNo={selectedLocationDetails.contactNo} />
                         </div>
                         <Button asChild variant="outline">
                            <a href={selectedLocationDetails.mapLocation} target="_blank" rel="noopener noreferrer">
                                <MapPin className="mr-2 h-4 w-4" /> View on Map
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
          )}
          
          <h2 className="font-headline text-3xl mb-6">Upcoming Pujas in <span className="text-primary">{selectedLocation || 'All Locations'}</span></h2>
          
          {filteredPujas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPujas.map(puja => (
                <PujaCard key={puja.id} puja={puja} />
              ))}
            </div>
          ) : (
             <div className="text-center py-16 bg-card rounded-lg shadow-sm border">
                <p className="text-muted-foreground font-semibold text-lg">No upcoming pujas found for this location.</p>
                <p className="text-muted-foreground mt-2">Please check back later or select a different location.</p>
             </div>
          )}
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0 bg-background/80 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                Built by Devotees. All rights reserved. &copy; {new Date().getFullYear()} Vaidic Pujas.
            </p>
        </div>
      </footer>
    </div>
  );
}
