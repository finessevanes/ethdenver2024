import { useEffect } from "react";

export default function HarpieComponent() {
  useEffect(() => {
    const reponse = fetch("https://api.harpie.io/v2/validateAddress", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: "74778fa4-88a8-4e35-922a-02bd82005edd",
        address: "0x55456cbd1f11298b80a53c896f4b1dc9bc16c731",
      }),
    }).then((response) => {
      console.log(response);
    });
  }, []);
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <div className='z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex'>
        Sponsor Me
      </div>
    </main>
  );
}
