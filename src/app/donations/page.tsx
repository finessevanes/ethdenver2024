"use client";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

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

export default function Donations() {
  const [formData, setFormData] = useState<DonationFormData>(defaultFormData);
  let [isMalicious, setIsMalicious] = useState();
  const { user } = usePrivy();
  const router = useRouter();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // Handle the form submission, e.g., send to an API
    console.log(formData);
    // router.push("/thank-you");
    // Redirect to the checkout page or display a confirmation message
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
                  "Gold Tier - $100 each (2 options) and you have prime real estate on the running shirt",
              },
              {
                tier: "silver",
                price: 50,
                label:
                  "Silver Tier - $50 each (4 options) and you have secondary real estate on the running shirt",
              },
              {
                tier: "bronze",
                price: 25,
                label:
                  "Bronze Tier - $25 each (10 options) and you have tertiary real estate on the running shirt",
              },
              {
                tier: "wagmi",
                price: 5,
                label:
                  "WAGMI - $5 to $25. Your name will be written with sharpie around the arms and upper back of the shirt. Name may be covered due to hydration pack.",
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
