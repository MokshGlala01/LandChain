import { ethers } from "ethers";

// Default local hardhat contract addresses
export const LAND_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const PROPERTY_TRANSFER_ADDRESS = process.env.NEXT_PUBLIC_TRANSFER_CONTRACT_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const LOCAL_RPC_URL = process.env.NEXT_PUBLIC_POLYGON_RPC || "http://127.0.0.1:8545";

// ABIs derived from Solidity contracts
export const LAND_REGISTRY_ABI = [
  "function registerProperty(string memory parcelId, string memory ipfsHash) external",
  "function transferOwnership(string memory parcelId, address newOwner) external",
  "function verifyOwner(string memory parcelId, address claimedOwner) external view returns (bool)",
  "function properties(string memory) external view returns (string memory parcelId, string memory ipfsHash, address owner, uint256 registeredAt, bool active)",
  "event PropertyRegistered(string parcelId, address owner, string ipfsHash)",
  "event OwnershipTransferred(string parcelId, address from, address to)"
];

export const PROPERTY_TRANSFER_ABI = [
  "function requestTransfer(string memory parcelId, address to, uint256 stampDuty) external",
  "function approveTransfer(string memory parcelId) external",
  "function rejectTransfer(string memory parcelId) external",
  "function transfers(string memory) external view returns (string memory parcelId, address from, address to, uint256 stampDuty, bool active, bool approved)",
  "event TransferRequested(string indexed parcelId, address indexed from, address indexed to, uint256 stampDuty)",
  "event TransferApproved(string indexed parcelId, address indexed from, address indexed to)",
  "event TransferRejected(string indexed parcelId)"
];

export function getProvider() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  return new ethers.JsonRpcProvider(LOCAL_RPC_URL);
}

export function getLandRegistryContract(signerOrProvider?: any) {
  const p = signerOrProvider || getProvider();
  return new ethers.Contract(LAND_REGISTRY_ADDRESS, LAND_REGISTRY_ABI, p);
}

export function getPropertyTransferContract(signerOrProvider?: any) {
  const p = signerOrProvider || getProvider();
  return new ethers.Contract(PROPERTY_TRANSFER_ADDRESS, PROPERTY_TRANSFER_ABI, p);
}

// Resilient wrapper functions with local mock fallbacks
export async function registerPropertyOnChain(parcelId: string, ipfsHash: string, signer?: any) {
  try {
    const contract = getLandRegistryContract(signer);
    const tx = await contract.registerProperty(parcelId, ipfsHash);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.warn("Blockchain transaction failed. Falling back to mock transaction hash.", error);
    return "0xmock_" + Math.random().toString(16).substring(2, 66);
  }
}

export async function transferPropertyOnChain(parcelId: string, newOwnerAddress: string, signer?: any) {
  try {
    const contract = getLandRegistryContract(signer);
    const tx = await contract.transferOwnership(parcelId, newOwnerAddress);
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.warn("Blockchain transaction failed. Falling back to mock transaction hash.", error);
    return "0xmock_" + Math.random().toString(16).substring(2, 66);
  }
}

export async function verifyOwnerOnChain(parcelId: string, ownerAddress: string) {
  try {
    const contract = getLandRegistryContract();
    return await contract.verifyOwner(parcelId, ownerAddress);
  } catch (error) {
    console.warn("Blockchain query failed. Returning null (fallback to DB).");
    return null; 
  }
}
