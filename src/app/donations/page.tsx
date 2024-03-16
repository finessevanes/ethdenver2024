"use client";

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
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useReadContract } from "wagmi";

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

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { open, close } = useWeb3Modal();

  const tierLevel = SponsorLevel[formData.tier.toUpperCase() as keyof typeof SponsorLevel];
  const { data: donationsLeftData, isLoading: isLoadingDonationsLeft } = useReadContract({
    abi: contractABI,
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    functionName: "usdToEth",
    args: [tierLevel],
  });


  useEffect(() => {
    const tierLevel =
      SponsorLevel[formData.tier.toUpperCase() as keyof typeof SponsorLevel];
    console.log("tierLevel", tierLevel);
    console.log('price in tier level: ', DonationTiers[formData.tier].usdValue);
  }, [formData.tier]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    // Simplify the condition check for donations left using the DonationTiers directly
    if (DonationTiers[formData.tier].usdValue <= 0) {
      setErrorMessage(
        `The ${formData.tier} tier is full. Please select another tier.`
      );
      setLoading(false);
      return;
    }

    try {
      console.log("Initiating donation process...");
      open(); // Assuming this method is used to prompt user wallet connection

      // If requiredWei is not set, abort the donation process
      if (!requiredWei || requiredWei === "0") {
        alert("Required wei amount for donation is not set. Please try again.");
        setLoading(false);
        return;
      }

      // Donation process logic goes here
      // Assuming a successful donation, navigate to thank-you page
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
        <div className="mb-4">
          <label
            htmlFor="customAmount"
            className="block text-sm font-medium text-gray-700"
          >
            Custom Donation Amount
          </label>
          <input
            type="number"
            name="price"
            id="price"
            value={5}
            onChange={handleInputChange}
            min={5}
            className="p-3 mt-1 text-black block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
          />
        </div>
      );
    }
    return null; // If not "wagmi", don't render anything
  };

  // Function to call usdToEth and log the conversion result
  const getRequiredWeiForDonation = async (
    tier: DonationTier,
    usdAmount: number
  ) => {
    try {
      console.log("tier", tier);
      console.log("usdAmount", usdAmount);
      // Call the smart contract function usdToEth to get the required amount in wei for the given USD amount
      // const requiredWei = useReadContract({
      //   abi: contractABI,
      //   address: "0x6b175474e89094c44da98b954eedeac495271d0f",
      //   functionName: "usdToEth",
      //   args: [usdAmount],
      // });

      // setRequiredWei(requiredWei);
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
    console.log("name", name);
    console.log("value", value);

    let newFormData = { ...formData, [name]: value };

    if (name === "tier") {
      const newTier = value as DonationTier;
      newFormData = {
        ...newFormData,
        tier: newTier,
      };
    } else if (name === "price" && formData.tier === "wagmi") {
      // If the tier is "wagmi" and price is being changed, directly use the new price for conversion
      newFormData = {
        ...newFormData,
      };
    }

    setFormData(newFormData);
    console.log("newFormData", newFormData);
    // Call getRequiredWeiForDonation with either the default tier value or the new custom price

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
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
          className="space-y-6 bg-white p-6 rounded-lg shadow-md"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name (as it will be shown on the shirt)
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name (this will be shown on the shirt for race day)"
              className="p-3 mt-1 text-black block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              required
            />
          </div>

          <fieldset className="mb-4">
            <legend className="text-sm font-medium text-gray-700">
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
              <div key={tier} className="flex items-center mb-4">
                <input
                  id={tier}
                  type="radio"
                  name="tier"
                  value={tier}
                  checked={formData.tier === tier}
                  onChange={handleInputChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <label
                  htmlFor={tier}
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  {label}
                </label>
              </div>
            ))}
          </fieldset>

          {renderCustomAmountInput()}

          <div className="mb-4">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Message
            </label>
            <textarea
              name="message"
              id="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="p-3 mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Leave a message for the runner"
            />
          </div>
          {errorMessage && (
            <div className="mb-4 text-red-500">{errorMessage}</div>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-blue-600"
          >
            Donate
          </button>
        </form>
      </div>
    </div>
  );
}
