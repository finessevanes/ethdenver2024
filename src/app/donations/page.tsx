"use client";

import { useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  DonationTiers,
  defaultFormData,
  sponsorMeAddress,
  SponsorLevel,
  DonationFormData,
  DonationTier,
} from "../../constants/contants";
import { contractABI } from "../../../src/contract/abi";

export default function Donations() {
  const [formData, setFormData] = useState<DonationFormData>(defaultFormData);
  const [requiredWei, setRequiredWei] = useState("0");
  const [isMalicious, setIsMalicious] = useState();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [donationsLeft, setDonationsLeft] = useState({
    gold: 0,
    silver: 0,
    bronze: 0,
    wagmi: Number.MAX_SAFE_INTEGER, // Assuming WAGMI has no max limit or you can dynamically fetch this too
  });

  const { wallets } = useWallets();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const fetchDonationsLeft = async (tier: any) => {
    if (!wallets.length) return;
    const provider = await wallets[0]?.getEthersProvider();
    const sponsorMeContract = new ethers.Contract(
      sponsorMeAddress,
      contractABI,
      provider
    );

    // Convert tier to SponsorLevel
    const tierToSponsorLevel: Record<string, number> = {
      gold: SponsorLevel.GOLD,
      silver: SponsorLevel.SILVER,
      bronze: SponsorLevel.BRONZE,
      wagmi: SponsorLevel.WAGMI,
    };

    const tierLevel = tierToSponsorLevel[tier];
    const donationsLeftForTier = await sponsorMeContract.donationsLeft(
      tierLevel
    );
    const formattedDonationsLeft = donationsLeftForTier.toString();

    // Update state with the fetched data
    setDonationsLeft((prev) => ({
      ...prev,
      [tier]: formattedDonationsLeft,
    }));
  };

  useEffect(() => {
    fetchDonationsLeft("gold");
    fetchDonationsLeft("silver");
    fetchDonationsLeft("bronze");
    getRequiredWeiForDonation("gold");
    // Wagmi can be fetched too if needed, or handled differently given it might not have a max limit
  }, [wallets]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    if (!wallets.length) {
      alert("Please connect your wallet.");
      setLoading(false);
      return;
    }

    if (Number(donationsLeft[formData.tier]) === 0) {
      setErrorMessage(
        `The ${formData.tier} tier is full. Please select another tier.`
      );
      return;
    }

    const provider = await wallets[0].getEthersProvider();
    const signer = provider.getSigner();
    const senderAddress = await signer.getAddress();
    const contract = new ethers.Contract(sponsorMeAddress, contractABI, signer);

    try {
      const donationTier =
        SponsorLevel[formData.tier.toUpperCase() as keyof typeof SponsorLevel];
      console.log("Donation tier", donationTier);

      // Ensure requiredWei is set correctly before attempting to make a donation
      if (!requiredWei || requiredWei === "0") {
        alert("Required wei amount for donation is not set. Please try again.");
        setLoading(false);
        return;
      }

      // Directly use requiredWei without converting, as it should already be in wei
      const tx = await contract.makeDonation(donationTier, senderAddress, {
        value: requiredWei.toString(),
      });
      await tx.wait();
      console.log("Donation made successfully", tx.hash);
      localStorage.setItem("tx", tx.hash);
      router.push("/thank-you");
    } catch (error) {
      console.error("Donation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCustomAmountInput = () => {
    if (formData.tier === "wagmi") {
      return (
        <div className='mb-4'>
          <label
            htmlFor='customAmount'
            className='block text-sm font-medium text-gray-700'
          >
            Custom Donation Amount
          </label>
          <input
            type='number'
            name='price'
            id='price'
            value={formData.price}
            onChange={handleInputChange}
            min={5}
            max={25}
            className='mt-1 text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50'
          />
        </div>
      );
    }
    return null; // If not "wagmi", don't render anything
  };

  // Function to call usdToEth and log the conversion result
  const getRequiredWeiForDonation = async (tier: DonationTier) => {
    if (!wallets.length) {
      console.error("Wallet is not connected");
      return;
    }

    const provider = await wallets[0]?.getEthersProvider();
    const contract = new ethers.Contract(
      sponsorMeAddress,
      contractABI,
      provider
    );

    // USD value for the selected tier
    const usdAmount =
      DonationTiers[tier as keyof typeof DonationTiers].usdValue;

    try {
      // Call the smart contract function usdToEth to get the required amount in wei
      const requiredWei = await contract.usdToEth(usdAmount);

      // Log the result to the console for verification
      console.log(
        `${tier} tier requires ${ethers.utils.formatUnits(
          requiredWei,
          "wei"
        )} wei (${ethers.utils.formatEther(requiredWei)} ETH) for donation.`
      );

      // Update state with the requiredWei for further processing or UI update
      setRequiredWei(requiredWei);
    } catch (error) {
      console.error("Failed to fetch required wei for donation:", error);
    }
  };

  // Ensure this function is called when a tier is selected
  const handleInputChange = async (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    if (name === "tier") {
      const newTier = value as DonationTier;
      if (newTier === "wagmi") {
        setRequiredWei(DonationTiers[newTier].usdValue.toString());
        console.log("WAGMI tier selected", requiredWei);
      }
      // Call getRequiredWeiForDonation to log the USD to ETH conversion for the selected tier
      await getRequiredWeiForDonation(newTier); // This will log the conversion result
      setFormData((prev) => ({
        ...prev,
        tier: newTier,
        price: DonationTiers[newTier].usdValue,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  useEffect(() => {
    fetch("https://api.harpie.io/v2/validateAddress", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: "74778fa4-88a8-4e35-922a-02bd82005edd",
        address: "0x9150C94dE175C6FA4d766a4e951E9c7ed204Ad1a",
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok (${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setIsMalicious(data.isMaliciousAddress);
        console.log("is malicious", isMalicious);
      })
      .catch((error) => {
        console.error("Fetching error:", error);
      });
  }, []);

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='container mx-auto p-6 bg-white rounded-lg shadow-md'>
        <h1 className='text-3xl font-bold text-center text-gray-800 mb-6'>
          Donations
        </h1>
        <div
          className={`p-4 mb-4 text-sm font-medium rounded-lg shadow-sm ${
            isMalicious
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {"We've checked this contract's wallet address with Harpie and it's "}
          {isMalicious ? "Malicious" : "Not Malicious"}
        </div>
        <form
          onSubmit={handleSubmit}
          className='space-y-6 bg-white p-6 rounded-lg shadow-md'
        >
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-gray-700'
            >
              Name (as it will be shown on the shirt)
            </label>
            <input
              type='text'
              name='name'
              id='name'
              value={formData.name}
              onChange={handleInputChange}
              placeholder='Enter your name (this will be shown on the shirt for race day)'
              className='mt-1 text-black block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50'
              required
            />
          </div>

          <fieldset className='mb-4'>
            <legend className='text-sm font-medium text-gray-700'>
              Donation Amount (checkout and placement on next page)
            </legend>

            {/* Iterate over tiers to create radio buttons */}
            {[
              {
                tier: "gold",
                price: 100,
                label: `Gold Tier - $100 each (${donationsLeft.gold} left) and you have prime real estate on the running shirt`,
              },
              {
                tier: "silver",
                price: 50,
                label: `Silver Tier - $50 each (${donationsLeft.silver} left) and you have secondary real estate on the running shirt`,
              },
              {
                tier: "bronze",
                price: 25,
                label: `Bronze Tier - $25 each (${donationsLeft.bronze} left) and you have tertiary real estate on the running shirt`,
              },
              {
                tier: "wagmi",
                price: 5,
                label:
                  "WAGMI - min $5. Your name will be written with sharpie around the arms and upper back of the shirt. Name may be covered due to hydration pack.",
              },
            ].map(({ tier, price, label }) => (
              <div key={tier} className='flex items-center mb-4'>
                <input
                  id={tier}
                  type='radio'
                  name='tier'
                  value={tier}
                  checked={formData.tier === tier}
                  onChange={handleInputChange}
                  className='focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300'
                />
                <label
                  htmlFor={tier}
                  className='ml-3 block text-sm font-medium text-gray-700'
                >
                  {label}
                </label>
              </div>
            ))}
          </fieldset>

          {renderCustomAmountInput()}

          <div className='mb-4'>
            <label
              htmlFor='message'
              className='block text-sm font-medium text-gray-700'
            >
              Message
            </label>
            <textarea
              name='message'
              id='message'
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className='mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
              placeholder='Leave a message for the runner'
            />
          </div>
          {errorMessage && (
            <div className='mb-4 text-red-500'>{errorMessage}</div>
          )}
          <button
            type='submit'
            className='px-4 py-2 bg-purple-600 text-white rounded hover:bg-blue-600'
          >
            Donate
          </button>
        </form>
      </div>
    </div>
  );
}
