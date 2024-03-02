"use client";

import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import { useRouter } from "next/navigation";

const ThankYouPage: React.FC = () => {
  const { logout } = usePrivy();
  const router = useRouter();

  const logoutUser = () => {
    logout();
    router.push("/");
  };
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
      <div className='text-center md:text-left'>
        <button
          className='bg-purple-600 text-white font-bold py-2 px-4 rounded-full mb-4'
          onClick={logoutUser}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ThankYouPage;
