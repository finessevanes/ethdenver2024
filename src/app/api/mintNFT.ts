// pages/api/sendData.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

type Data = {
  message?: string;
  error?: string;
};

// Replace with your contract's ABI and address
const contractABI = "";
const contractAddress = "YOUR_CONTRACT_ADDRESS";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    try {
      // Your Ethereum provider URL
      const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
      // Create a signer
      const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
      // Connect to the contract
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Example: Sending data to the smart contract
      const data = req.body.data; // Make sure to validate and sanitize in production
      const tx = await contract.sendData(data); // Assuming `sendData` is a function in your contract
      await tx.wait();

      res.status(200).json({ message: "Data sent successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Error sending data to the smart contract" });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
