export const DonationTiers = {
    gold: { name: "gold", usdValue: 100 },
    silver: { name: "silver", usdValue: 50 },
    bronze: { name: "bronze", usdValue: 25 },
    wagmi: { name: "wagmi", usdValue: 5 },
  };
  
  export const defaultFormData = {
    name: "",
    tier: "gold",
    message: "",
    price: DonationTiers.gold.usdValue,
  };
  
  export const sponsorMeAddress = "0xd0188931d6062E104C42C7935Cd588118EdA4D2A";
  
  export const SponsorLevel = {
    GOLD: 0,
    SILVER: 1,
    BRONZE: 2,
    WAGMI: 3,
  };
