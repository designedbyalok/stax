// Client-safe option lists for profile/onboarding pickers and insights.
// Dependency-free (no Prisma) so it can be imported from client components.
//
// Country + city are chosen from these lists (no free typing). Salary
// benchmarks for any role × city are generated on demand by AI and cached, so
// coverage isn't limited to a hand-curated table.

export type CountryConfig = {
  country: string;
  currency: string;
  /** Top metros for the country, in rough order of prominence. */
  cities: string[];
};

export const COUNTRIES: CountryConfig[] = [
  {
    country: "India",
    currency: "INR",
    cities: ["Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Pune", "Chennai", "Kolkata"],
  },
  {
    country: "United States",
    currency: "USD",
    cities: ["San Francisco", "New York", "Seattle", "Austin", "Boston", "Los Angeles", "Chicago"],
  },
  {
    country: "United Kingdom",
    currency: "GBP",
    cities: ["London", "Manchester", "Edinburgh", "Bristol", "Cambridge"],
  },
  {
    country: "Australia",
    currency: "AUD",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Canberra"],
  },
  {
    country: "New Zealand",
    currency: "NZD",
    cities: ["Auckland", "Wellington", "Christchurch"],
  },
  {
    country: "Canada",
    currency: "CAD",
    cities: ["Toronto", "Vancouver", "Montreal", "Ottawa"],
  },
  {
    country: "Singapore",
    currency: "SGD",
    cities: ["Singapore"],
  },
  {
    country: "Germany",
    currency: "EUR",
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt"],
  },
  {
    country: "Ireland",
    currency: "EUR",
    cities: ["Dublin", "Cork"],
  },
  {
    country: "United Arab Emirates",
    currency: "AED",
    cities: ["Dubai", "Abu Dhabi"],
  },
];

export const KNOWN_COUNTRIES: string[] = COUNTRIES.map((c) => c.country);

export const KNOWN_ROLES: string[] = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Product Manager",
  "Product Designer",
  "UX Designer",
  "Data Scientist",
  "Data Analyst",
  "Marketing Manager",
  "Sales Manager",
];

const byCountry = new Map(COUNTRIES.map((c) => [c.country, c]));

/** Cities available for a country (empty array if unknown). */
export function citiesForCountry(country?: string | null): string[] {
  if (!country) return [];
  return byCountry.get(country)?.cities ?? [];
}

/** The country a city belongs to, searching every country's metro list. */
export function countryForCity(city?: string | null): string | undefined {
  if (!city) return undefined;
  const key = city.trim().toLowerCase();
  for (const c of COUNTRIES) {
    if (c.cities.some((m) => m.toLowerCase() === key)) return c.country;
  }
  return undefined;
}

export const COUNTRY_CURRENCY: Record<string, string> = Object.fromEntries(
  COUNTRIES.map((c) => [c.country, c.currency])
);

export const CURRENCIES: string[] = Array.from(
  new Set(["INR", "USD", "GBP", "EUR", "AUD", "NZD", "CAD", "SGD", "AED"])
);

export function currencyForCountry(country?: string | null): string {
  if (!country) return "USD";
  return COUNTRY_CURRENCY[country] ?? "USD";
}

// Aliases → canonical metro label, so any legacy/free value still resolves to a
// known city for benchmark lookups.
const CITY_SYNONYMS: Record<string, string> = {
  bangalore: "Bengaluru",
  bengaluru: "Bengaluru",
  blr: "Bengaluru",
  bombay: "Mumbai",
  "new delhi": "Delhi NCR",
  delhi: "Delhi NCR",
  ncr: "Delhi NCR",
  gurgaon: "Delhi NCR",
  gurugram: "Delhi NCR",
  noida: "Delhi NCR",
  madras: "Chennai",
  calcutta: "Kolkata",
};

/** Maps a free/legacy city onto a known metro, else null. */
export function canonicalCity(city?: string | null): string | null {
  if (!city) return null;
  const key = city.trim().toLowerCase();
  if (CITY_SYNONYMS[key]) return CITY_SYNONYMS[key];
  for (const c of COUNTRIES) {
    const hit = c.cities.find((m) => m.toLowerCase() === key);
    if (hit) return hit;
  }
  return null;
}
