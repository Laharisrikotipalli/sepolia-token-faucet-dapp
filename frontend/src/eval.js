window.__EVAL__ = {
  async connectWallet() {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  },

  async requestTokens() {
    const tx = await faucet.requestTokens();
    await tx.wait();
    return tx.hash;
  },

  async getBalance() {
    const balance = await token.balanceOf(userAddress);
    return balance.toString();
  },

  async canClaim() {
    return await faucet.canClaim(userAddress);
  },

  async getRemainingAllowance() {
    const remaining = await faucet.remainingAllowance(userAddress);
    return remaining.toString();
  },

  async getContractAddresses() {
    return {
      token: "0x05ee75359EBbC0fB29ae76bc0a7E078Baa0A8f24",
      faucet: "0xB5e68a59C63ab7d47C0F93cd571605AEcF7EB9E6"
    };
  }
};
