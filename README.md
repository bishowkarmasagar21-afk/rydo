# RYDO

RYDO is a ride-hailing platform for passengers and drivers.

## Features

- Passenger registration and login
- Driver registration and verification
- Ride booking with pickup and destination search
- Automatic fare estimation
- Live driver tracking view
- Mapbox integration ready

## Quick start

1. Install dependencies:

   npm install

2. Copy environment file:

   cp .env.example .env

3. Add your Mapbox public token in `.env`.

4. Run app:

   npm run dev

## Project structure

- `src/App.jsx` – main app UI
- `src/components/MapPanel.jsx` – map panel with Mapbox support
- `src/lib/fare.js` – pricing logic
- `src/data/mockData.js` – sample trip and driver data
