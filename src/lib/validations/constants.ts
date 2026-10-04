export const BD_PHONE_REGEX = /^(?:\+8801|01)[3-9]\d{8}$/;
export const PASSWORD_UPPERCASE = /[A-Z]/;
export const PASSWORD_NUMBER = /\d/;
export const PASSWORD_SYMBOL = /[^A-Za-z0-9]/;

export const normalizeEmail = (value: string): string => value.trim().toLowerCase();

export const normalizePhone = (value: string): string => {
  const trimmed = value.trim();
  return trimmed.startsWith("01") ? `+880${trimmed.slice(1)}` : trimmed;
};

export const ALLOWED_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "totalAmount",
  "status",
] as const;
export type AllowedSortField = (typeof ALLOWED_SORT_FIELDS)[number];

export const PICKUP_CONDITIONS = [
  "GOOD",
  "DAMAGED",
  "PACKAGING_WORN",
] as const;
export type PickupCondition = (typeof PICKUP_CONDITIONS)[number];

export const DELIVERY_FAILURE_REASONS = [
  "RECIPIENT_UNAVAILABLE",
  "WRONG_ADDRESS",
  "REFUSED",
  "BAD_WEATHER",
  "OTHER",
] as const;
export type DeliveryFailureReason =
  (typeof DELIVERY_FAILURE_REASONS)[number];

export const ASSIGNMENT_REJECT_REASONS = [
  "VEHICLE_ISSUE",
  "PERSONAL_EMERGENCY",
  "WRONG_ZONE",
  "PACKAGE_CONFLICT",
  "OTHER",
] as const;
export type AssignmentRejectReason =
  (typeof ASSIGNMENT_REJECT_REASONS)[number];

export const PKG_CATEGORIES = [
  "general",
  "documents",
  "clothing",
  "electronics",
  "books",
  "food",
  "pharmacy",
  "cosmetics",
  "gifts",
  "fragile",
  "other",
] as const;
export type PkgCategory = (typeof PKG_CATEGORIES)[number];

export interface DistrictZone {
  district: string;
  zoneId: string;
  region: "Dhaka" | "Chittagong" | "Rajshahi" | "Khulna" | "Barisal" | "Sylhet" | "Rangpur" | "Mymensingh";
}

const dhaka: DistrictZone[] = [
  { district: "Dhaka", zoneId: "DHK", region: "Dhaka" },
  { district: "Gazipur", zoneId: "DHK", region: "Dhaka" },
  { district: "Narayanganj", zoneId: "DHK", region: "Dhaka" },
  { district: "Tangail", zoneId: "DHK-N", region: "Dhaka" },
  { district: "Kishoreganj", zoneId: "DHK-N", region: "Dhaka" },
  { district: "Manikganj", zoneId: "DHK-W", region: "Dhaka" },
  { district: "Munshiganj", zoneId: "DHK-S", region: "Dhaka" },
  { district: "Narsingdi", zoneId: "DHK-E", region: "Dhaka" },
  { district: "Faridpur", zoneId: "DHK-SW", region: "Dhaka" },
  { district: "Gopalganj", zoneId: "DHK-SW", region: "Dhaka" },
  { district: "Madaripur", zoneId: "DHK-SW", region: "Dhaka" },
  { district: "Shariatpur", zoneId: "DHK-S", region: "Dhaka" },
  { district: "Rajbari", zoneId: "DHK-W", region: "Dhaka" },
  { district: "Mymensingh", zoneId: "MYM", region: "Mymensingh" },
  { district: "Jamalpur", zoneId: "MYM-N", region: "Mymensingh" },
  { district: "Sherpur", zoneId: "MYM-N", region: "Mymensingh" },
  { district: "Netrokona", zoneId: "MYM-E", region: "Mymensingh" },
  { district: "Kishoregonj", zoneId: "DHK-N", region: "Dhaka" },
];

const chittagong: DistrictZone[] = [
  { district: "Chattogram", zoneId: "CTG", region: "Chittagong" },
  { district: "Chittagong", zoneId: "CTG", region: "Chittagong" },
  { district: "Cox's Bazar", zoneId: "CTG-S", region: "Chittagong" },
  { district: "Noakhali", zoneId: "CTG-N", region: "Chittagong" },
  { district: "Feni", zoneId: "CTG-N", region: "Chittagong" },
  { district: "Lakshmipur", zoneId: "CTG-N", region: "Chittagong" },
  { district: "Chandpur", zoneId: "CTG-NW", region: "Chittagong" },
  { district: "Comilla", zoneId: "CTG-NW", region: "Chittagong" },
  { district: "Cumilla", zoneId: "CTG-NW", region: "Chittagong" },
  { district: "Brahmanbaria", zoneId: "CTG-NE", region: "Chittagong" },
  { district: "Khagrachari", zoneId: "CTG-H", region: "Chittagong" },
  { district: "Rangamati", zoneId: "CTG-H", region: "Chittagong" },
  { district: "Bandarban", zoneId: "CTG-H", region: "Chittagong" },
];

const sylhet: DistrictZone[] = [
  { district: "Sylhet", zoneId: "SYL", region: "Sylhet" },
  { district: "Sunamganj", zoneId: "SYL-N", region: "Sylhet" },
  { district: "Habiganj", zoneId: "SYL-S", region: "Sylhet" },
  { district: "Moulvibazar", zoneId: "SYL-S", region: "Sylhet" },
];

const rajshahi: DistrictZone[] = [
  { district: "Rajshahi", zoneId: "RAJ", region: "Rajshahi" },
  { district: "Natore", zoneId: "RAJ-E", region: "Rajshahi" },
  { district: "Chapainawabganj", zoneId: "RAJ-W", region: "Rajshahi" },
  { district: "Naogaon", zoneId: "RAJ-N", region: "Rajshahi" },
  { district: "Bogra", zoneId: "RAJ-NE", region: "Rajshahi" },
  { district: "Joypurhat", zoneId: "RAJ-N", region: "Rajshahi" },
  { district: "Pabna", zoneId: "RAJ-SE", region: "Rajshahi" },
  { district: "Sirajganj", zoneId: "RAJ-SE", region: "Rajshahi" },
  { district: "Rangpur", zoneId: "RNG", region: "Rangpur" },
  { district: "Dinajpur", zoneId: "RNG-N", region: "Rangpur" },
  { district: "Thakurgaon", zoneId: "RNG-N", region: "Rangpur" },
  { district: "Panchagarh", zoneId: "RNG-N", region: "Rangpur" },
  { district: "Kurigram", zoneId: "RNG-E", region: "Rangpur" },
  { district: "Gaibandha", zoneId: "RNG-SE", region: "Rangpur" },
  { district: "Nilphamari", zoneId: "RNG-SW", region: "Rangpur" },
  { district: "Lalmonirhat", zoneId: "RNG-E", region: "Rangpur" },
];

const khulna: DistrictZone[] = [
  { district: "Khulna", zoneId: "KHL", region: "Khulna" },
  { district: "Jessore", zoneId: "KHL-N", region: "Khulna" },
  { district: "Jashore", zoneId: "KHL-N", region: "Khulna" },
  { district: "Satkhira", zoneId: "KHL-W", region: "Khulna" },
  { district: "Bagerhat", zoneId: "KHL-SW", region: "Khulna" },
  { district: "Narail", zoneId: "KHL-NE", region: "Khulna" },
  { district: "Magura", zoneId: "KHL-NE", region: "Khulna" },
  { district: "Meherpur", zoneId: "KHL-NW", region: "Khulna" },
  { district: "Chuadanga", zoneId: "KHL-NW", region: "Khulna" },
  { district: "Kushtia", zoneId: "KHL-N", region: "Khulna" },
  { district: "Jhenaidah", zoneId: "KHL-N", region: "Khulna" },
  { district: "Barisal", zoneId: "BAR", region: "Barisal" },
  { district: "Barishal", zoneId: "BAR", region: "Barisal" },
  { district: "Patuakhali", zoneId: "BAR-S", region: "Barisal" },
  { district: "Pirojpur", zoneId: "BAR-N", region: "Barisal" },
  { district: "Bhola", zoneId: "BAR-E", region: "Barisal" },
  { district: "Barguna", zoneId: "BAR-SW", region: "Barisal" },
  { district: "Jhalokati", zoneId: "BAR-C", region: "Barisal" },
];

export const BD_DISTRICTS_WITH_ZONES: DistrictZone[] = [
  ...dhaka,
  ...chittagong,
  ...sylhet,
  ...rajshahi,
  ...khulna,
];
