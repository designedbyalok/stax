// Client-safe option lists for profile/onboarding pickers. Kept dependency-free
// (no Prisma) so it can be imported from client components. These mirror the
// curated benchmark dataset in `benchmarks.ts` (which is server-only).

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

export const KNOWN_COUNTRIES: string[] = ["United States", "United Kingdom", "India"];

/** City → country, so picking a city can pre-fill the country. */
export const CITY_OPTIONS: { city: string; country: string }[] = [
  { city: "San Francisco", country: "United States" },
  { city: "New York", country: "United States" },
  { city: "Austin", country: "United States" },
  { city: "London", country: "United Kingdom" },
  { city: "Bangalore", country: "India" },
  { city: "Mumbai", country: "India" },
];

export const KNOWN_CITIES: string[] = CITY_OPTIONS.map((c) => c.city);

export const COUNTRY_CURRENCY: Record<string, string> = {
  "United States": "USD",
  "United Kingdom": "GBP",
  India: "INR",
};

export const CURRENCIES: string[] = ["USD", "GBP", "EUR", "INR", "CAD", "AUD", "SGD"];

export function currencyForCountry(country?: string | null): string {
  if (!country) return "USD";
  return COUNTRY_CURRENCY[country] ?? "USD";
}

export function countryForCity(city?: string | null): string | undefined {
  if (!city) return undefined;
  return CITY_OPTIONS.find((c) => c.city.toLowerCase() === city.toLowerCase())?.country;
}
