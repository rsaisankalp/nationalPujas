# **App Name**: Vaidic Pujas Discovery

## Core Features:

- CSV Data Import and Polling: Import puja data from a CSV file fetched from the provided Google Sheets URL. Periodically poll the URL to update the data every 10 minutes.
- Geolocation Determination: Determine the user's location (latitude and longitude) based on their IP address using a round-robin approach with multiple APIs to avoid rate limiting.
- Distance Calculation: Calculate the distance between the user's location and predefined locations (using location identifier), storing these in a local storage.
- Location-Based Puja Listings: Display pujas filtered and sorted based on the calculated distance to the user's location. Allow the user to select a location from a dropdown to view relevant pujas. The location will come from location identifier field in the csv file
- Detailed Puja Information: Show detailed information for each puja, including the event name, sub-purpose, date, time, venue, city, district, map location, and registration link, mapLocation and other data.
- Image Handling: Associate each puja with an image from the `/public/images/pujas` directory using the 'Sub-Purpose' field (with spaces replaced by hyphens) as the filename.

## Style Guidelines:

- Primary color: Deep Saffron (#F4A22D), conveying cultural richness.
- Background color: Light Beige (#F5F5DC), for a warm, inviting feel.
- Accent color: Muted Gold (#D4AF37), to highlight important elements such as CTAs and location information.
- Headline font: 'Playfair', a modern sans-serif similar to Didot, geometric, high contrast thin-thick lines, with an elegant, fashionable, high-end feel.
- Body font: 'PT Sans', a humanist sans-serif that combines a modern look and a little warmth or personality.
- Utilize clear and relevant icons for categories such as location, time, and registration to improve usability.
- Adopt a layout inspired by BookMyShow, featuring a dropdown for location selection and clear, card-based presentation of puja listings.