import Image from "next/image";

const ThankYouPage: React.FC = () => {
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
    </div>
  );
};

export default ThankYouPage;
