// base contract mainnet
export const sponsorMeAddress = "0x6c11a2F8B07E5aFB3157065a6238d304E7F69B13";

export const DonationTiers = {
  gold: { usdValue: 100 },
  silver: { usdValue: 50 },
  bronze: { usdValue: 25 },
  wagmi: { usdValue: 5 },
};

export type DonationTier = keyof typeof DonationTiers;

export interface DonationFormData {
  name: string;
  tier: DonationTier;
  message: string;
  price: number;
}

export const defaultFormData: DonationFormData = {
  name: "",
  tier: "gold", // Default tier set to 'gold'
  message: "",
  price: DonationTiers.gold.usdValue,
};

export const SponsorLevel = {
  GOLD: 0,
  SILVER: 1,
  BRONZE: 2,
  WAGMI: 3,
};
