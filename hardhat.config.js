require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Expected variables in .env:
// SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your-key
// PRIVATE_KEY=0xyourprivatekey
// ETHERSCAN_API_KEY=youretherscanapikey

const { SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

const networks = {
  hardhat: {},
  localhost: {
    url: "http://127.0.0.1:8545",
  },
};

if (SEPOLIA_RPC_URL && PRIVATE_KEY) {
  networks.sepolia = {
    url: SEPOLIA_RPC_URL,
    accounts: [PRIVATE_KEY],
  };
}

module.exports = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "cancun",
    },
  },
  networks,
  etherscan: {
    apiKey: ETHERSCAN_API_KEY || "",
  },
};
