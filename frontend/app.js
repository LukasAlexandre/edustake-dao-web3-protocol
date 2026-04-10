(function () {
  const { ethers } = window;
  const config = window.EDUSTAKE_CONFIG;
  const mockData = window.EDUSTAKE_MOCK_DATA;

  const tokenAbi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
  ];

  const nftAbi = [
    "function mintBadge(address to, string tokenUri) external returns (uint256)",
    "function balanceOf(address owner) external view returns (uint256)",
  ];

  const stakingAbi = [
    "function stake(uint256 amount) external",
    "function getStakedBalance(address account) external view returns (uint256)",
    "function getPendingRewards(address account) external view returns (uint256)",
    "function getCurrentApyBps() external view returns (uint256)",
    "function totalStaked() external view returns (uint256)",
  ];

  const daoAbi = [
    "function vote(uint256 proposalId, bool support) external",
    "function proposalCount() external view returns (uint256)",
    "function getProposal(uint256 proposalId) external view returns ((uint256 id,string title,string description,uint256 yesVotes,uint256 noVotes,uint256 deadline,bool executed,address proposer))",
  ];

  const priceConsumerAbi = [
    "function getLatestPrice() external view returns (int256)",
    "function getPriceFeedDecimals() external view returns (uint8)",
  ];

  const state = {
    provider: null,
    signer: null,
    walletAddress: null,
    network: null,
    contracts: loadConfig(),
    activities: [],
    live: {
      eduBalance: "0,00 EDU",
      nftCount: "0 badges",
      stakingBalance: "0,00 EDU",
      governancePower: "0,00 EDU",
      oraclePrice: "$ --",
      apy: "--%",
      totalStaked: "-- EDU",
      pendingRewards: "-- EDU",
      synced: false,
    },
  };

  const elements = {
    connectWalletBtn: document.getElementById("connectWalletBtn"),
    refreshDataBtn: document.getElementById("refreshDataBtn"),
    connectedAddress: document.getElementById("connectedAddress"),
    networkName: document.getElementById("networkName"),
    networkHint: document.getElementById("networkHint"),
    appStatus: document.getElementById("appStatus"),
    statusTimestamp: document.getElementById("statusTimestamp"),
    configForm: document.getElementById("configForm"),
    resetConfigBtn: document.getElementById("resetConfigBtn"),
    stakeForm: document.getElementById("stakeForm"),
    voteForm: document.getElementById("voteForm"),
    mintForm: document.getElementById("mintForm"),
    proposalList: document.getElementById("proposalList"),
    badgeGrid: document.getElementById("badgeGrid"),
    activityList: document.getElementById("activityList"),
    protocolStatsGrid: document.getElementById("protocolStatsGrid"),
    docsLink: document.getElementById("docs"),
    faucetLink: document.getElementById("faucet"),
    eduBalanceValue: document.getElementById("eduBalanceValue"),
    eduBalanceMeta: document.getElementById("eduBalanceMeta"),
    nftBalanceValue: document.getElementById("nftBalanceValue"),
    stakedValue: document.getElementById("stakedValue"),
    stakedMeta: document.getElementById("stakedMeta"),
    governancePowerValue: document.getElementById("governancePowerValue"),
    oraclePriceValue: document.getElementById("oraclePriceValue"),
    apyValue: document.getElementById("apyValue"),
    totalStakedValue: document.getElementById("totalStakedValue"),
    pendingRewardsValue: document.getElementById("pendingRewardsValue"),
    stakingPositionValue: document.getElementById("stakingPositionValue"),
    stakingRewardsValue: document.getElementById("stakingRewardsValue"),
    stakingApyValue: document.getElementById("stakingApyValue"),
    progressLabel: document.getElementById("progressLabel"),
    stakingProgressBar: document.getElementById("stakingProgressBar"),
  };

  function loadConfig() {
    const saved = window.localStorage.getItem(config.storageKey);
    if (!saved) return { ...config.defaultContracts };

    try {
      return { ...config.defaultContracts, ...JSON.parse(saved) };
    } catch (error) {
      console.warn("Configuração local inválida, restaurando padrão.", error);
      return { ...config.defaultContracts };
    }
  }

  function saveConfig(nextConfig) {
    state.contracts = nextConfig;
    window.localStorage.setItem(config.storageKey, JSON.stringify(nextConfig));
  }

  function setStatus(message, tone = "neutral") {
    elements.appStatus.textContent = message;
    elements.statusTimestamp.textContent = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const consoleElement = document.getElementById("statusConsole");
    consoleElement.style.borderColor =
      tone === "error"
        ? "rgba(255, 126, 126, 0.28)"
        : tone === "success"
          ? "rgba(124, 227, 139, 0.22)"
          : "rgba(255, 255, 255, 0.06)";
  }

  function formatAddress(address) {
    if (!address || address.length < 10) return "0x----...----";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function formatToken(value, suffix = "EDU") {
    const formatted = Number(value).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${formatted} ${suffix}`;
  }

  function formatUsd(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value));
  }

  function formatApy(value) {
    return `${Number(value).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}%`;
  }

  function isConfiguredAddress(address) {
    return Boolean(address) && ethers.isAddress(address);
  }

  function hydrateConfigForm() {
    document.getElementById("tokenAddress").value = state.contracts.token;
    document.getElementById("nftAddress").value = state.contracts.nft;
    document.getElementById("stakingAddress").value = state.contracts.staking;
    document.getElementById("daoAddress").value = state.contracts.dao;
    document.getElementById("priceConsumerAddress").value = state.contracts.priceConsumer;
  }

  function renderProtocolLinks() {
    elements.docsLink.href = config.docsUrl;
    elements.faucetLink.href = config.faucetUrl;
  }

  function renderBadges() {
    elements.badgeGrid.innerHTML = mockData.badges
      .map(
        (badge) => `
          <article class="badge-card">
            <div class="badge-card__mark">${badge.icon}</div>
            <div>
              <strong>${badge.title}</strong>
              <div class="badge-card__footer">
                <span class="badge-meta">${badge.tokenNumber}</span>
                <span class="status-badge status-badge--${badge.accent === "green" ? "executada" : badge.accent === "cyan" ? "ativa" : "encerrada"}">${badge.tag}</span>
              </div>
            </div>
          </article>
        `,
      )
      .join("");
  }

  function recordActivity({ title, context, hash }) {
    const next = {
      title,
      context,
      hash,
      time: "agora",
    };

    state.activities = [next, ...state.activities].slice(0, 12);
    renderActivities();
  }

  function renderActivities() {
    if (!state.activities.length) {
      elements.activityList.innerHTML = `
        <article class="activity-item">
          <div>
            <strong>Nenhuma atividade registrada</strong>
            <span class="activity-meta">Faça stake, vote ou minte um NFT para aparecer aqui.</span>
            <small>—</small>
          </div>
          <span class="activity-meta">—</span>
        </article>
      `;
      return;
    }

    elements.activityList.innerHTML = state.activities
      .map(
        (activity) => `
          <article class="activity-item">
            <div>
              <strong>${activity.title}</strong>
              <span class="activity-meta">${activity.context}</span>
              <small>${activity.hash ? formatAddress(activity.hash) : "—"}</small>
            </div>
            <span class="activity-meta">${activity.time}</span>
          </article>
        `,
      )
      .join("");
  }

  function renderProtocolStats() {
    elements.protocolStatsGrid.innerHTML = mockData.protocolStats
      .map(
        (item) => `
          <article class="stats-item">
            <span>${item.label}</span>
            <strong>${item.value}</strong>
            <small>${item.delta}</small>
          </article>
        `,
      )
      .join("");
  }

  function proposalStatus(deadline, executed) {
    if (executed) return "executada";
    return Number(deadline) * 1000 > Date.now() ? "ativa" : "encerrada";
  }

  function renderProposals(proposals) {
    elements.proposalList.innerHTML = proposals
      .map((proposal) => {
        const statusClass = `status-badge--${proposal.status}`;
        const statusLabel =
          proposal.status === "ativa"
            ? "Ativa"
            : proposal.status === "executada"
              ? "Executada"
              : "Encerrada";

        return `
          <article class="proposal-item">
            <div class="proposal-top">
              <span class="proposal-id">#${proposal.id}</span>
              <span class="status-badge ${statusClass}">${statusLabel}</span>
            </div>
            <div class="proposal-title-row">
              <div>
                <strong>${proposal.title}</strong>
                <div class="proposal-meta">Proposto por ${proposal.proposer}</div>
              </div>
            </div>
            <div class="proposal-votes">
              <span>Sim: ${proposal.yesVotes}</span>
              <span>Não: ${proposal.noVotes}</span>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function parseLocaleNumber(label) {
    const normalized = String(label)
      .replace(/[^\d,.-]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    const numeric = Number.parseFloat(normalized);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  function updateOverviewUI() {
    elements.eduBalanceValue.textContent = state.live.eduBalance;
    elements.eduBalanceMeta.textContent = state.walletAddress
      ? `Carteira ${formatAddress(state.walletAddress)}`
      : "Conecte a carteira para sincronizar";
    elements.nftBalanceValue.textContent = state.live.nftCount;
    elements.stakedValue.textContent = state.live.stakingBalance;
    elements.stakedMeta.textContent = state.live.synced
      ? "Posição sincronizada on-chain"
      : "Dados simulados ou aguardando conexão";
    elements.governancePowerValue.textContent = state.live.governancePower;
    elements.oraclePriceValue.textContent = state.live.oraclePrice;
    elements.apyValue.textContent = state.live.apy;
    elements.totalStakedValue.textContent = state.live.totalStaked;
    elements.pendingRewardsValue.textContent = state.live.pendingRewards;
    elements.stakingPositionValue.textContent = state.live.stakingBalance;
    elements.stakingRewardsValue.textContent = state.live.pendingRewards;
    elements.stakingApyValue.textContent = state.live.apy;

    const stakedNumber = parseLocaleNumber(state.live.stakingBalance);
    const balanceNumber = parseLocaleNumber(state.live.eduBalance);
    const progress = balanceNumber > 0 ? Math.min((stakedNumber / balanceNumber) * 100, 100) : 0;

    elements.progressLabel.textContent = `${progress.toFixed(0)}%`;
    elements.stakingProgressBar.style.width = `${progress}%`;
  }

  function updateWalletUI() {
    elements.connectedAddress.textContent = formatAddress(state.walletAddress);
    elements.connectWalletBtn.querySelector(".wallet-chip__label").textContent = state.walletAddress
      ? "Carteira conectada"
      : "Conectar carteira";
  }

  function updateNetworkUI() {
    if (!state.network) {
      elements.networkName.textContent = config.expectedNetworkName;
      elements.networkHint.textContent = "Aguardando conexão";
      return;
    }

    const current = Number(state.network.chainId);
    const isExpected = current === config.expectedChainId;

    elements.networkName.textContent = state.network.name
      ? `${state.network.name} (${current})`
      : `Chain ${current}`;
    elements.networkHint.textContent = isExpected
      ? "Rede compatível com o protocolo"
      : `Rede divergente. Esperado: ${config.expectedNetworkName}`;
  }

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("MetaMask não encontrada. Instale a extensão para operar o dashboard.", "error");
      return;
    }

    try {
      state.provider = new ethers.BrowserProvider(window.ethereum);
      await state.provider.send("eth_requestAccounts", []);
      state.signer = await state.provider.getSigner();
      state.walletAddress = await state.signer.getAddress();
      state.network = await state.provider.getNetwork();

      updateWalletUI();
      updateNetworkUI();
      setStatus(`Carteira ${formatAddress(state.walletAddress)} conectada com sucesso.`, "success");

      await syncLiveData();
    } catch (error) {
      setStatus(`Falha ao conectar carteira: ${error.message}`, "error");
    }
  }

  async function syncLiveData() {
    if (!state.provider || !state.walletAddress) {
      updateOverviewUI();
      renderProposals(mockData.proposals);
      return;
    }

    const reader = state.signer || state.provider;
    const token = isConfiguredAddress(state.contracts.token)
      ? new ethers.Contract(state.contracts.token, tokenAbi, reader)
      : null;
    const nft = isConfiguredAddress(state.contracts.nft)
      ? new ethers.Contract(state.contracts.nft, nftAbi, reader)
      : null;
    const staking = isConfiguredAddress(state.contracts.staking)
      ? new ethers.Contract(state.contracts.staking, stakingAbi, reader)
      : null;
    const dao = isConfiguredAddress(state.contracts.dao)
      ? new ethers.Contract(state.contracts.dao, daoAbi, reader)
      : null;
    const priceConsumer = isConfiguredAddress(state.contracts.priceConsumer)
      ? new ethers.Contract(state.contracts.priceConsumer, priceConsumerAbi, reader)
      : null;

    const results = await Promise.allSettled([
      token ? token.balanceOf(state.walletAddress) : Promise.resolve(null),
      nft ? nft.balanceOf(state.walletAddress) : Promise.resolve(null),
      staking ? staking.getStakedBalance(state.walletAddress) : Promise.resolve(null),
      staking ? staking.getPendingRewards(state.walletAddress) : Promise.resolve(null),
      staking ? staking.getCurrentApyBps() : Promise.resolve(null),
      staking ? staking.totalStaked() : Promise.resolve(null),
      priceConsumer ? priceConsumer.getLatestPrice() : Promise.resolve(null),
      priceConsumer ? priceConsumer.getPriceFeedDecimals() : Promise.resolve(null),
      dao ? dao.proposalCount() : Promise.resolve(null),
    ]);

    const [
      eduBalanceRes,
      nftBalanceRes,
      stakingBalanceRes,
      pendingRewardsRes,
      apyRes,
      totalStakedRes,
      oraclePriceRes,
      oracleDecimalsRes,
      proposalCountRes,
    ] = results;

    if (eduBalanceRes.status === "fulfilled" && eduBalanceRes.value !== null) {
      const balance = ethers.formatUnits(eduBalanceRes.value, 18);
      state.live.eduBalance = formatToken(balance);
      state.live.governancePower = formatToken(balance);
    }

    if (nftBalanceRes.status === "fulfilled" && nftBalanceRes.value !== null) {
      state.live.nftCount = `${nftBalanceRes.value.toString()} badges`;
    }

    if (stakingBalanceRes.status === "fulfilled" && stakingBalanceRes.value !== null) {
      state.live.stakingBalance = formatToken(ethers.formatUnits(stakingBalanceRes.value, 18));
    }

    if (pendingRewardsRes.status === "fulfilled" && pendingRewardsRes.value !== null) {
      state.live.pendingRewards = formatToken(ethers.formatUnits(pendingRewardsRes.value, 18));
    }

    if (apyRes.status === "fulfilled" && apyRes.value !== null) {
      state.live.apy = formatApy(Number(apyRes.value) / 100);
    }

    if (totalStakedRes.status === "fulfilled" && totalStakedRes.value !== null) {
      state.live.totalStaked = formatToken(ethers.formatUnits(totalStakedRes.value, 18));
    }

    if (
      oraclePriceRes.status === "fulfilled" &&
      oraclePriceRes.value !== null &&
      oracleDecimalsRes.status === "fulfilled" &&
      oracleDecimalsRes.value !== null
    ) {
      state.live.oraclePrice = formatUsd(
        Number(ethers.formatUnits(oraclePriceRes.value, oracleDecimalsRes.value)),
      );
    }

    const proposalCount =
      proposalCountRes.status === "fulfilled" && proposalCountRes.value !== null
        ? Number(proposalCountRes.value)
        : 0;

    let liveProposals = mockData.proposals;

    if (dao && proposalCount > 0) {
      const ids = Array.from({ length: Math.min(proposalCount, 5) }, (_, index) => proposalCount - index);
      const proposalReads = await Promise.allSettled(ids.map((id) => dao.getProposal(id)));

      liveProposals = proposalReads
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value)
        .map((proposal) => ({
          id: Number(proposal.id),
          title: proposal.title,
          proposer: formatAddress(proposal.proposer),
          yesVotes: formatToken(ethers.formatUnits(proposal.yesVotes, 18)),
          noVotes: formatToken(ethers.formatUnits(proposal.noVotes, 18)),
          status: proposalStatus(proposal.deadline, proposal.executed),
        }));
    }

    state.live.synced = true;
    renderProposals(liveProposals);
    updateOverviewUI();
    setStatus("Dados on-chain atualizados com sucesso.", "success");
  }

  function extractError(error) {
    return error?.shortMessage || error?.reason || error?.message || "falha desconhecida";
  }

  async function mintNFT(event) {
    event.preventDefault();

    if (!state.signer) {
      setStatus("Conecte a carteira antes de mintar um badge.", "error");
      return;
    }

    if (!isConfiguredAddress(state.contracts.nft)) {
      setStatus("Configure um endereço válido para EduBadgeNFT.", "error");
      return;
    }

    const recipient = document.getElementById("nftRecipient").value.trim();
    const tokenUri = document.getElementById("nftTokenUri").value.trim();

    if (!ethers.isAddress(recipient)) {
      setStatus("Informe uma carteira de destino válida para o NFT.", "error");
      return;
    }

    try {
      const contract = new ethers.Contract(state.contracts.nft, nftAbi, state.signer);
      const tx = await contract.mintBadge(recipient, tokenUri);
      setStatus(`Mint de badge enviado. Hash: ${tx.hash}`);
      await tx.wait();
      setStatus("Badge NFT mintado com sucesso.", "success");
      recordActivity({
        title: "NFT badge mintado",
        context: `Destino ${formatAddress(recipient)}`,
        hash: tx.hash,
      });
      await syncLiveData();
    } catch (error) {
      setStatus(`Erro ao mintar NFT: ${extractError(error)}`, "error");
    }
  }

  async function stakeTokens(event) {
    event.preventDefault();

    if (!state.signer) {
      setStatus("Conecte a carteira antes de enviar stake.", "error");
      return;
    }

    if (!isConfiguredAddress(state.contracts.token) || !isConfiguredAddress(state.contracts.staking)) {
      setStatus("Configure endereços válidos de EduToken e Staking.", "error");
      return;
    }

    const amountValue = document.getElementById("stakeAmount").value.trim();
    const amount = ethers.parseUnits(amountValue || "0", 18);

    if (amount <= 0n) {
      setStatus("Informe uma quantidade de stake maior que zero.", "error");
      return;
    }

    try {
      const tokenContract = new ethers.Contract(state.contracts.token, tokenAbi, state.signer);
      const stakingContract = new ethers.Contract(state.contracts.staking, stakingAbi, state.signer);

      const approveTx = await tokenContract.approve(state.contracts.staking, amount);
      setStatus(`Approval enviada. Hash: ${approveTx.hash}`);
      await approveTx.wait();

      const stakeTx = await stakingContract.stake(amount);
      setStatus(`Stake enviado. Hash: ${stakeTx.hash}`);
      await stakeTx.wait();

      setStatus(`Stake de ${amountValue} EDU concluído com sucesso.`, "success");
      recordActivity({
        title: `Stake de ${amountValue} EDU`,
        context: "Staking on-chain",
        hash: stakeTx.hash,
      });
      await syncLiveData();
    } catch (error) {
      setStatus(`Erro ao fazer stake: ${extractError(error)}`, "error");
    }
  }

  async function voteProposal(event) {
    event.preventDefault();

    if (!state.signer) {
      setStatus("Conecte a carteira antes de votar.", "error");
      return;
    }

    if (!isConfiguredAddress(state.contracts.dao)) {
      setStatus("Configure um endereço válido para SimpleDAO.", "error");
      return;
    }

    const proposalId = Number(document.getElementById("proposalId").value.trim());
    const support = document.getElementById("voteChoice").value === "true";

    if (!proposalId) {
      setStatus("Informe um ID de proposta válido.", "error");
      return;
    }

    try {
      const daoContract = new ethers.Contract(state.contracts.dao, daoAbi, state.signer);
      const tx = await daoContract.vote(proposalId, support);
      setStatus(`Voto enviado para a proposta #${proposalId}. Hash: ${tx.hash}`);
      await tx.wait();
      setStatus(`Voto registrado na proposta #${proposalId}.`, "success");
      recordActivity({
        title: `Voto na proposta #${proposalId}`,
        context: support ? "Voto: Sim" : "Voto: Não",
        hash: tx.hash,
      });
      await syncLiveData();
    } catch (error) {
      setStatus(`Erro ao votar: ${extractError(error)}`, "error");
    }
  }

  function bindScrollActions() {
    document.querySelectorAll("[data-scroll-target]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = document.getElementById(button.dataset.scrollTarget);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function bindEvents() {
    elements.connectWalletBtn.addEventListener("click", connectWallet);
    elements.refreshDataBtn.addEventListener("click", syncLiveData);
    elements.mintForm.addEventListener("submit", mintNFT);
    elements.stakeForm.addEventListener("submit", stakeTokens);
    elements.voteForm.addEventListener("submit", voteProposal);

    elements.configForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nextConfig = {
        token: document.getElementById("tokenAddress").value.trim(),
        nft: document.getElementById("nftAddress").value.trim(),
        staking: document.getElementById("stakingAddress").value.trim(),
        dao: document.getElementById("daoAddress").value.trim(),
        priceConsumer: document.getElementById("priceConsumerAddress").value.trim(),
      };

      saveConfig(nextConfig);
      setStatus("Configuração do dashboard salva localmente.", "success");
      await syncLiveData();
    });

    elements.resetConfigBtn.addEventListener("click", () => {
      saveConfig({ ...config.defaultContracts });
      hydrateConfigForm();
      setStatus("Endereços restaurados para o padrão do template.");
    });

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", async (accounts) => {
        state.walletAddress = accounts[0] || null;

        if (state.walletAddress) {
          state.provider = new ethers.BrowserProvider(window.ethereum);
          state.signer = await state.provider.getSigner();
          updateWalletUI();
          await syncLiveData();
        } else {
          state.provider = null;
          state.signer = null;
          state.live.synced = false;
          updateWalletUI();
          updateOverviewUI();
          renderProposals(mockData.proposals);
          setStatus("Carteira desconectada.");
        }
      });

      window.ethereum.on("chainChanged", async () => {
        if (state.provider) {
          state.network = await state.provider.getNetwork();
          updateNetworkUI();
          await syncLiveData();
        }
      });
    }
  }

  function bootstrap() {
    hydrateConfigForm();
    renderProtocolLinks();
    renderBadges();
    renderActivities();
    renderProtocolStats();
    renderProposals(mockData.proposals);
    updateWalletUI();
    updateNetworkUI();
    updateOverviewUI();
    bindEvents();
    bindScrollActions();
  }

  bootstrap();
})();
