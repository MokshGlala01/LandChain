/**
 * IPFS integration helper using Pinata's HTTP REST API
 */

export async function uploadFileToIPFS(file: File | Blob, filename: string): Promise<string> {
  const apiKey = process.env.PINATA_API_KEY || process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const secretKey = process.env.PINATA_SECRET_KEY || process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

  if (!apiKey || !secretKey) {
    console.warn("Pinata API keys not configured. Simulating IPFS upload.");
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    // Generate a mock hash
    return "Qm" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  try {
    const formData = new FormData();
    formData.append("file", file, filename);

    const metadata = JSON.stringify({
      name: filename,
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", options);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: apiKey,
        pinata_secret_api_key: secretKey,
      },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Pinata API response error: ${errText}`);
    }

    const data = await res.json();
    return data.IpfsHash;
  } catch (error) {
    console.error("IPFS Upload error in uploadFileToIPFS:", error);
    throw error;
  }
}
