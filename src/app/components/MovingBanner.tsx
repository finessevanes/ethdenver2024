interface MovingBannerProps {
  text: string;
}

export const MovingBanner: React.FC<MovingBannerProps> = ({ text }) => {
  return (
    <div className='overflow-hidden whitespace-nowrap bg-[#84E748] p-4 w-full'>
      <div className='animate-marquee py-1 uppercase'>{text}</div>
    </div>
  );
};
