import { useEffect, useState } from "react";
import { ethers } from "ethers";

const TOKEN_ADDRESS = "0x05ee75359EBbC0fB29ae76bc0a7E078Baa0A8f24";
const FAUCET_ADDRESS = "0xB5e68a59C63ab7d47C0F93cd571605AEcF7EB9E6";

const tokenABI = [
  "function balanceOf(address) view returns (uint256)"
];

const faucetABI = [
  "function requestTokens()",
  "function canClaim(address) view returns (bool)",
  "function remainingAllowance(address) view returns (uint256)"
];

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    setAccount(accounts[0]);
    loadBalance(accounts[0]);
  };

  const loadBalance = async (addr) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const token = new ethers.Contract(TOKEN_ADDRESS, tokenABI, provider);

    const bal = await token.balanceOf(addr);
    setBalance(ethers.formatEther(bal));
  };

  const claimTokens = async () => {
    try {
      setStatus("Processing transaction...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const faucet = new ethers.Contract(FAUCET_ADDRESS, faucetABI, signer);

      const tx = await faucet.requestTokens();
      await tx.wait();

      setStatus("Tokens claimed successfully!");
      loadBalance(account);
    } catch (error) {
      setStatus(error.reason || "Transaction failed");
    }
  };

  useEffect(() => {
    window.__EVAL__ = {
      async connectWallet() {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts"
        });
        return accounts[0];
      },

      async requestTokens() {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const faucet = new ethers.Contract(FAUCET_ADDRESS, faucetABI, signer);

        const tx = await faucet.requestTokens();
        await tx.wait();
        return tx.hash;
      },

      async getBalance(address) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const token = new ethers.Contract(TOKEN_ADDRESS, tokenABI, provider);
        const bal = await token.balanceOf(address);
        return bal.toString();
      },

      async canClaim(address) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const faucet = new ethers.Contract(FAUCET_ADDRESS, faucetABI, provider);
        return await faucet.canClaim(address);
      },

      async getRemainingAllowance(address) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const faucet = new ethers.Contract(FAUCET_ADDRESS, faucetABI, provider);
        const remaining = await faucet.remainingAllowance(address);
        return remaining.toString();
      },

      async getContractAddresses() {
        return {
          token: TOKEN_ADDRESS,
          faucet: FAUCET_ADDRESS
        };
      }
    };
  }, []);

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#0f172a",
      color: "white"
    }}>
      <div style={{
        backgroundColor: "#1e293b",
        padding: "40px",
        borderRadius: "12px",
        width: "400px",
        textAlign: "center",
        boxShadow: "0 0 20px rgba(0,0,0,0.5)"
      }}>
        <h2>Sepolia Token Faucet</h2>

        {!account ? (
          <button onClick={connectWallet}>
            Connect Wallet
          </button>
        ) : (
          <>
            <p><b>Connected:</b></p>
            <p style={{ fontSize: "12px" }}>{account}</p>

            <p><b>Balance:</b> {balance} Tokens</p>

            <button onClick={claimTokens}>
              Claim Tokens
            </button>

            <p style={{ marginTop: "10px", color: "#38bdf8" }}>
              {status}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
