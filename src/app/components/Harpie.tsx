export default function Harpie() {
  fetch("https://api.harpie.io/v2/validateAddress", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      apiKey: process.env.NEXT_PUBLIC_URL,
      address: "0x55456cbd1f11298b80a53c896f4b1dc9bc16c731",
    }),
  });
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <div className='z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex'>
        Sponsor Me
      </div>
    </main>
  );
}
