"use client";
import { useEffect, useState } from "react";

export default function Home() {
  let [isMalicious, setIsMalicious] = useState();
  useEffect(() => {
    fetch("https://api.harpie.io/v2/validateAddress", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: "74778fa4-88a8-4e35-922a-02bd82005edd",
        address: "0x55456cbd1f11298b80a53c896f4b1dc9bc16c731",
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
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <div className='z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex'>
        Sponsor Me
      </div>
      <div className='z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex'>
        {isMalicious ? "Malicious" : "Not Malicious"}
      </div>
    </main>
  );
}
