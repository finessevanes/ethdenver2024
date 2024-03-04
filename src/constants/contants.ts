export const sponsorMeAddress = "0x3E28d39Bee8366502d8eA3327a13f9f35Fa788dd";

export const DonationTiers = {
  gold: { name: "gold", usdValue: 100 },
  silver: { name: "silver", usdValue: 50 },
  bronze: { name: "bronze", usdValue: 25 },
  wagmi: { name: "wagmi", usdValue: 5 },
};

export type DonationTier = "gold" | "silver" | "bronze" | "wagmi";
export interface DonationFormData {
  name: string;
  tier: DonationTier;
  message: string;
  price: number; // This might be redundant now, consider removing if not needed elsewhere
}

export const defaultFormData: DonationFormData = {
  name: "",
  tier: "gold", // Just the tier name, as before
  message: "",
  price: DonationTiers.gold.usdValue, // Default amount for gold tier, can be dynamically set based on the tier
};

export const SponsorLevel = {
  GOLD: 0,
  SILVER: 1,
  BRONZE: 2,
  WAGMI: 3,
};
