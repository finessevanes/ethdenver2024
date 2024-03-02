"use client";
import donateAndMintNFT from "@/contract/utils";
import { useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {contractABI} from "../../../src/contract/abi";

type DonationTier = "gold" | "silver" | "bronze" | "wagmi";

interface DonationFormData {
  name: string;
  tier: DonationTier;
  message: string;
  price: number;
}

const defaultFormData: DonationFormData = {
  name: "",
  tier: "gold", // default selected tier
  message: "",
  price: 100, // default amount for gold tier
};

const sponsorMeAddress = '0x4E458670f6E80fA3F33C8c16Ac712318054C6d5f';

const SponsorLevel = {
  GOLD: 0,
  SILVER: 1,
  BRONZE: 2,
  WAGMI: 3
};


export default function Donations() {
  const [formData, setFormData] = useState<DonationFormData>(defaultFormData);
  let [isMalicious, setIsMalicious] = useState();
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
    const sponsorMeContract = new ethers.Contract(sponsorMeAddress, contractABI, provider);
  
    // Convert tier to SponsorLevel
    const tierToSponsorLevel = {
      gold: SponsorLevel.GOLD,
      silver: SponsorLevel.SILVER,
      bronze: SponsorLevel.BRONZE,
      wagmi: SponsorLevel.WAGMI,
    };
  
    const tierLevel = tierToSponsorLevel[tier];
    const donationsLeftForTier = await sponsorMeContract.donationsLeft(tierLevel);
    const formattedDonationsLeft = donationsLeftForTier.toString();
  
    // Update state with the fetched data
    setDonationsLeft((prev) => ({
      ...prev,
      [tier]: formattedDonationsLeft,
    }));
  };
  
  
  useEffect(() => {
    fetchDonationsLeft('gold');
    fetchDonationsLeft('silver');
    fetchDonationsLeft('bronze');
    // Wagmi can be fetched too if needed, or handled differently given it might not have a max limit
  }, [wallets]);
  
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const provider = await wallets[0]?.getEthersProvider();
      const signer = provider?.getSigner();

      // Convert the deposit amount to the correct format for sending
      const amountInEther = ethers.utils.parseEther(formData.price.toString());
      const contractAddress = "your_contract_address";

      const tx = await signer?.sendTransaction({
        to: contractAddress,
        value: amountInEther,
      });

      const receipt = await tx?.wait();

      if (receipt && receipt.status === 1) {
        console.log("Donation transaction confirmed");
        // Here, you would call your smart contract method to mint the NFT
        // and handle it similarly, waiting for the transaction receipt
      } else {
        console.error("Transaction failed");
      }
    } catch (error) {
      console.error("Donation failed", error);
    } finally {
      setLoading(false);
      router.push("/thank-you");
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          {"We've checked this address with Harpie and it's "}
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
                label:
                  `Gold Tier - $100 each (${donationsLeft.gold} left) and you have prime real estate on the running shirt`,
              },
              {
                tier: "silver",
                price: 50,
                label:
                  `Silver Tier - $50 each (${donationsLeft.silver} left) and you have secondary real estate on the running shirt`,
              },
              {
                tier: "bronze",
                price: 25,
                label:
                  `Bronze Tier - $25 each (${donationsLeft.bronze} left) and you have tertiary real estate on the running shirt`,
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

          <button
            type='submit'
            className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          >
            Donate
          </button>
        </form>
      </div>
    </div>
  );
}
