import { ethers } from "ethers";

async function getEthAmountForUsd(
  amountInUsd: number,
  contract: ethers.Contract
): Promise<string> {
  const amountInEth = await contract.ethToUsd(amountInUsd);
  return amountInEth;
}

// Send ETH to the smart contract and mint an NFT
async function donateAndMintNFT(
  amountInUsd: number,
  contractAddress: string,
  abi: any,
  userAddress: string
): Promise<void> {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  const contract = new ethers.Contract(contractAddress, abi, signer);

  // Get the amount in ETH
  const amountInEth = await getEthAmountForUsd(amountInUsd, contract);

  // Send ETH to the contract
  const tx = await signer.sendTransaction({
    to: contractAddress,
    value: ethers.utils.parseEther(amountInEth),
  });
  await tx.wait();

  const mintTx = await contract.mintNFT(userAddress); // Replace with your contract's minting function
  await mintTx.wait();
}

export default donateAndMintNFT;
