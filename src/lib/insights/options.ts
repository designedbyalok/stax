// Client-safe option lists for profile/onboarding pickers. Kept dependency-free
// (no Prisma) so it can be imported from client components. These mirror the
// curated benchmark dataset in `benchmarks.ts` (which is server-only).
//
// Coverage is currently focused on the top Indian metro cities.

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

export const KNOWN_COUNTRIES: string[] = ["India"];

/** Top Indian metros we have benchmark coverage for. City → country. */
export const CITY_OPTIONS: { city: string; country: string }[] = [
  { city: "Bengaluru", country: "India" },
  { city: "Mumbai", country: "India" },
  { city: "Delhi NCR", country: "India" },
  { city: "Hyderabad", country: "India" },
  { city: "Pune", country: "India" },
  { city: "Chennai", country: "India" },
  { city: "Kolkata", country: "India" },
];

export const KNOWN_CITIES: string[] = CITY_OPTIONS.map((c) => c.city);

export const COUNTRY_CURRENCY: Record<string, string> = {
  India: "INR",
};

export const CURRENCIES: string[] = ["INR", "USD"];

export function currencyForCountry(country?: string | null): string {
  if (!country) return "INR";
  return COUNTRY_CURRENCY[country] ?? "INR";
}

export function countryForCity(city?: string | null): string | undefined {
  if (!city) return undefined;
  return CITY_OPTIONS.find((c) => c.city.toLowerCase() === city.toLowerCase())?.country;
}
