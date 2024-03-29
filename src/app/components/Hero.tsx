"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { MovingBanner } from "./MovingBanner";

export default function MarathonBanner() {
  const { login, authenticated } = usePrivy();
  const router = useRouter();

  const donate = async () => {
    if (authenticated) {
      router.push("/donations");
    } else {
      login();
    }
  };

  return (
    <div className='flex flex-col items-center justify-start min-h-screen bg-white w-full'>
      <MovingBanner text='ADD YOUR NAME ON MY SHIRT FOR RACE DAY * LA MARATHON 2024' />
      <div className='w-full flex flex-col md:flex-row items-center justify-center py-6 px-4 md:px-12'>
        <div className='w-1/3'>
          <p className='text-sm text-purple-700 py-4'>LA MARATHON 2024</p>
          <h1 className='text-4xl font-bold mb-4 text-center md:text-left text-black'>
            Add your name to my shirt for race day
          </h1>
          <p className='mb-6 text-center md:text-left text-black'>
            Fuel my run as I prepare for the LA Marathon 2024 through donation.
            Donations over $5 will be added to my shirt on race day.
          </p>
          <div className='text-center md:text-left'>
            <button
              className='bg-purple-600 text-white font-bold py-2 px-4 rounded-full mb-4'
              onClick={donate}
            >
              Donate
            </button>
          </div>
        </div>
        <div className='flex justify-center items-center md:w-1/2 h-300'>
          <Image
            src='/pepehero.png'
            alt='Marathon Runner'
            width={400}
            height={300}
          />
        </div>
      </div>
      <MovingBanner text="THEY SAY 'PAIN IS TEMPORARY, PRIDE IS FOREVER.' I SAY 'PAIN IS TEMPORARY, BUT YOUR SPONSORSHIP CAN MAKE IT FEEL LIKE IT'S OVER FASTER, MAN.'" />
    </div>
  );
}
