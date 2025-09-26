export interface Puja {
  id: string;
  eventName: string;
  subPurpose: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  district: string;
  state: string;
  locationIdentifier: string;
  mapLocation: string;
  latlong: string;
  registrationLink: string;
}

export interface LocationInfo {
  name: string;
  lat: number;
  lng: number;
  distance?: number;
}

export interface UserLocation {
    latitude: number;
    longitude: number;
}
