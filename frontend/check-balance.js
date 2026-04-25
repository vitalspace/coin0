import { publicClient, getTokenBalance, toEvmAddress } from './app/lib/services/coin.factory.service';
import memecoinABI from './app/lib/abi/memecoin.json';

async function checkBalance() {
  // Tu wallet
  const walletAddress = "0x71970DA41478661012a432C1fC423a666eE65E20";
  
  // Pool ID del que estas
  const poolAddress = process.argv[2];
  
  if (!poolAddress) {
    console.log("Usage: node check-balance.js <pool-address>");
    process.exit(1);
  }

  console.log("Checking balance for wallet:", walletAddress);
  console.log("Pool address:", poolAddress);
  
  try {
    // Primero obtenemos el mint del pool
    const poolMint = await publicClient.readContract({
      address: poolAddress as `0x${string}`,
      abi: [{ 
        name: 'mint', 
        type: 'function', 
        inputs: [], 
        outputs: [{ name: '', type: 'address' }], 
        stateMutability: 'view' 
      }],
      functionName: 'mint',
      args: [],
    });
    
    console.log("Pool mint token:", poolMint);
    
    // Ahora obtenemos balance
    const balance = await getTokenBalance(poolMint as string, walletAddress);
    console.log("Raw balance (wei):", balance.toString());
    console.log("Balance (human):", Number(balance) / 1e9);
    
    // Tambien chequeamos decimales
    const decimals = await publicClient.readContract({
      address: poolMint as `0x${string}`,
      abi: memecoinABI,
      functionName: 'decimals',
    });
    console.log("Token decimals:", decimals);
    
  } catch (e) {
    console.error("Error:", e);
  }
}

checkBalance();