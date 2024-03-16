"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ThankYouPage: React.FC = () => {
  const [tx, setTx] = useState("");
  const router = useRouter();

  const logoutUser = () => {
    router.push("/");
  };

  useEffect(() => {
    const storedTx = "https://basescan.org/tx/" + localStorage.getItem("tx");
    setTx(storedTx !== null ? storedTx : "");
  }, []);
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-white p-6'>
      <h1 className='text-3xl font-bold text-center text-green-600 mb-6'>
        Thank You for Your Donation!
      </h1>
      <Image
        src='/thankyoupepe.jpg'
        alt='Celebration'
        width={300}
        height={200}
        className='rounded'
      />
      <p className='text-center text-gray-700 mt-4'>
        We greatly appreciate your support. An exclusive NFT has been sent to
        your address as a token of our gratitude.
      </p>
      <p className='p-4 mb-4 text-sm font-medium rounded-lg '>
        <a
          href={tx}
          target='_blank'
          className='text-black shadow-smtext-green-800'
        >
          Here is your transaction
        </a>
      </p>

      <div className='text-center md:text-left'>
        <button
          className='bg-purple-600 text-white font-bold mt-8 py-2 px-4 rounded-full mb-4'
          onClick={logoutUser}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ThankYouPage;
