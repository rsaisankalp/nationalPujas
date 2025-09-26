'use client';

import * as React from 'react';
import { MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LocationInfo } from '@/lib/types';

interface HeaderProps {
  locations: LocationInfo[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

export function Header({ locations, selectedLocation, onLocationChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <a href="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold text-xl md:text-2xl font-headline text-primary">Vaidic Pujas</span>
          </a>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-4">
            <Select value={selectedLocation} onValueChange={onLocationChange}>
              <SelectTrigger className="w-[180px] md:w-[250px] font-semibold text-sm md:text-base">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location.name} value={location.name}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
      </div>
    </header>
  );
}
