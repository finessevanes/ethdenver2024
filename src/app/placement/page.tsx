"use client";
import Image from "next/image";
import { useState } from "react";

interface PlacementProps {
  tierName: string;
  tierCost: number;
  tierDescription: string;
}

export default function Placement({
  tierName,
  tierCost,
  tierDescription,
}: PlacementProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");

  // Mock function to handle form submission
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form submitted with option:", selectedOption);
    // Add your form submission logic here
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-3xl font-bold mb-6 text-center'>Placement</h1>

      <div className='flex justify-center mb-6'></div>
      <Image src={"/shirt.svg"} width={300} height={300} alt='Tshirt tier' />
      <form onSubmit={handleSubmit}>
        <div className='bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
          <h2 className='text-xl font-semibold mb-4'>
            You Selected Silver Tier
          </h2>
          <p className='text-gray-700 mb-4'>
            Silver Tier
            <br />
            Cost is $50 each (4 options) and you have secondary real estate on
            the running shirt
          </p>

          <div className='mb-4'>
            <label
              htmlFor='option1'
              className='block text-gray-700 text-sm font-bold mb-2'
            >
              Name Location (give us your first two options)
            </label>
            <input
              type='text'
              id='option1'
              placeholder='Option 1'
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline'
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            />
            <input
              type='text'
              id='option2'
              placeholder='Option 2'
              className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            />
          </div>

          <div className='flex justify-center'>
            <button
              className='bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
              type='submit'
            >
              Continue
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
