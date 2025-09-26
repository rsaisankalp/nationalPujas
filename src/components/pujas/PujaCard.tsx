'use client';

import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Puja } from '@/lib/types';
import { Calendar, Clock, MapPin } from 'lucide-react';
import PujaImage from './PujaImage';

function formatDate(dateString: string): string {
  const cleanedDateString = dateString
    .replace(/(\d+)(st|nd|rd|th)/, '$1');

  try {
    const date = new Date(cleanedDateString);
    if (isNaN(date.getTime())) { // If parsing fails, try appending current century for two-digit years
        const withCentury = cleanedDateString.replace(/(\s\d+)$/, ' 20$1');
        const dateWithCentury = new Date(withCentury);
         if (isNaN(dateWithCentury.getTime())) throw new Error('Invalid date');
         return format(dateWithCentury, 'E, MMM dd, yyyy');
    }
    return format(date, 'E, MMM dd, yyyy');
  } catch (e) {
    console.warn(`Could not parse date: "${dateString}". Displaying original.`);
    return dateString;
  }
}

function formatTime(timeString: string): string {
  try {
    const [h, m] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(h, 10), parseInt(m, 10));
    return format(date, 'p');
  } catch (e) {
    return timeString;
  }
}

export function PujaCard({ puja }: { puja: Puja }) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border">
      <CardHeader className="p-0 relative">
        <Badge variant="secondary" className="absolute top-3 right-3 z-10 bg-primary/80 text-primary-foreground backdrop-blur-sm">
          {puja.subPurpose}
        </Badge>
        <PujaImage
          subPurpose={puja.subPurpose}
          altText={puja.eventName}
          className="w-full h-48 object-cover"
        />
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-3">
        <CardTitle className="font-headline text-xl leading-tight h-14 line-clamp-2">{puja.eventName}</CardTitle>
        <div className="text-muted-foreground text-sm space-y-2">
            <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary"/> <span>{formatDate(puja.date)}</span></p>
            <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary"/> <span>{formatTime(puja.time)}</span></p>
            <p className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-primary"/> <span className="line-clamp-2">{puja.venue}</span></p>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/30">
        <Button asChild className="w-full font-bold">
          <a href={puja.registrationLink} target="_blank" rel="noopener noreferrer">
            Register Now
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
