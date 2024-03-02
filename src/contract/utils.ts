import { ethers } from "ethers";

async function getEthAmountForUsd(
  amountInUsd: number,
  contract: ethers.Contract
): Promise<string> {
  const amountInEth = await contract.ethToUsd(amountInUsd);
  return amountInEth;
}
