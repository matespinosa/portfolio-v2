// Real client work, and the markets each product runs in.
// `match` must equal the Natural Earth country name in
// world-atlas/countries-110m — that's the key the globe joins on.

export const CLIENTS = [
  {
    id: 'kapital',
    name: 'Kapital Bank',
    kind: 'Banking platform',
    countries: ['Colombia', 'Mexico'],
  },
  {
    id: 'credicorp',
    name: 'Credicorp Capital',
    kind: 'Investment banking',
    countries: ['Peru', 'Chile', 'Colombia'],
  },
  {
    id: 'rappi',
    name: 'Rappi',
    kind: 'Delivery super-app',
    countries: [
      'Colombia',
      'Mexico',
      'Brazil',
      'Argentina',
      'Chile',
      'Peru',
      'Ecuador',
      'Uruguay',
      'Costa Rica',
    ],
  },
  {
    id: 'modyo',
    name: 'Modyo',
    kind: 'Digital experience platform',
    countries: ['Peru', 'Mexico', 'Colombia'],
  },
]

const PLACES = [
  { id: 'mx', match: 'Mexico', name: 'Mexico', city: 'Mexico City', lat: 19.4326, lon: -99.1332 },
  { id: 'co', match: 'Colombia', name: 'Colombia', city: 'Bogotá', lat: 4.711, lon: -74.0721 },
  { id: 'cl', match: 'Chile', name: 'Chile', city: 'Santiago', lat: -33.4489, lon: -70.6693 },
  { id: 'pe', match: 'Peru', name: 'Peru', city: 'Lima', lat: -12.0464, lon: -77.0428 },
  { id: 'br', match: 'Brazil', name: 'Brazil', city: 'São Paulo', lat: -23.5505, lon: -46.6333 },
  { id: 'ar', match: 'Argentina', name: 'Argentina', city: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
  { id: 'ec', match: 'Ecuador', name: 'Ecuador', city: 'Quito', lat: -0.1807, lon: -78.4678 },
  { id: 'uy', match: 'Uruguay', name: 'Uruguay', city: 'Montevideo', lat: -34.9011, lon: -56.1645 },
  { id: 'cr', match: 'Costa Rica', name: 'Costa Rica', city: 'San José', lat: 9.9281, lon: -84.0907 },
]

/** Every country, with the clients whose products run there. */
export const COUNTRIES = PLACES.map((place) => ({
  ...place,
  clients: CLIENTS.filter((c) => c.countries.includes(place.match)),
})).sort((a, b) => b.clients.length - a.clients.length || a.name.localeCompare(b.name))

/** Bogotá is the studio base and the globe's resting point. */
export const HOME = COUNTRIES.find((c) => c.id === 'co')

export const HIGHLIGHTED = new Set(COUNTRIES.map((c) => c.match))
