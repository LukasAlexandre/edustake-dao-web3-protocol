const hostname = window.location.hostname;
const isLocalDashboard = hostname === "127.0.0.1" || hostname === "localhost";
const docsUrl = "../README.md";

const networkPreset = isLocalDashboard
  ? {
      expectedChainId: 31337,
      expectedNetworkName: "Localhost 8545",
      faucetUrl: docsUrl,
      explorerBaseUrl: "",
      faucetCardTitle: "Node local",
      faucetCardDescription: "Importe uma conta Hardhat na MetaMask para testar sem faucet.",
      autoLoadLocalContracts: true,
      localDevRpcUrl: "http://127.0.0.1:8545",
      localDevAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      localDevPrivateKey:
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    }
  : {
      expectedChainId: 11155111,
      expectedNetworkName: "Sepolia Testnet",
      faucetUrl: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia",
      explorerBaseUrl: "https://sepolia.etherscan.io",
      faucetCardTitle: "Faucet Sepolia",
      faucetCardDescription: "Solicite ETH de teste para operar o MVP.",
      autoLoadLocalContracts: false,
    };

window.EDUSTAKE_CONFIG = {
  appName: "EduStake DAO",
  docsUrl,
  docsCardTitle: "Docs",
  docsCardDescription: "Guia do projeto e arquitetura do protocolo.",
  localContractsUrl: "./local-contracts.json",
  storageKey: isLocalDashboard
    ? "edustake-dao-dashboard-config-local"
    : "edustake-dao-dashboard-config",
  defaultContracts: {
    token: "",
    nft: "",
    staking: "",
    dao: "",
    priceConsumer: "",
  },
  ...networkPreset,
};
