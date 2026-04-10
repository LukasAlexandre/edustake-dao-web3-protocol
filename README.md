# EduStake DAO Web3 Protocol

MVP acadêmico de um protocolo Web3 para educação, engajamento de comunidade e demonstração prática de componentes centrais do ecossistema Ethereum.

O projeto reúne:

- token ERC-20 para utilidade e governança
- NFT ERC-721 para badges acadêmicas
- contrato de staking com recompensas
- DAO simplificada para propostas e votação
- integração com oracle Chainlink ETH/USD
- scripts com ethers.js
- deploy na Sepolia testnet

> Este repositório é um MVP acadêmico. O objetivo é demonstrar arquitetura, integração e fluxo de uso, não fornecer uma implementação pronta para produção.

## Estrutura do projeto

```bash
edustake-dao-web3-protocol/
├── contracts/
│   ├── EduToken.sol
│   ├── EduBadgeNFT.sol
│   ├── PriceConsumer.sol
│   ├── Staking.sol
│   ├── SimpleDAO.sol
│   └── MockV3Aggregator.sol
├── scripts/
│   ├── deploy.js
│   ├── mintNFT.js
│   ├── stake.js
│   └── vote.js
├── test/
│   └── protocol.test.js
├── audit/
│   └── relatorio_auditoria.md
├── frontend/
│   ├── assets/
│   │   └── logo.svg
│   ├── app.js
│   ├── config.js
│   ├── index.html
│   ├── mock-data.js
│   ├── README.md
│   └── styles.css
├── README.md
├── hardhat.config.js
└── package.json
```

## Objetivo do protocolo

O EduStake DAO Web3 Protocol foi pensado para cenários educacionais descentralizados, nos quais participantes podem:

- receber tokens `EDU`
- bloquear tokens em staking
- acumular recompensas
- receber NFTs como badges de conclusão ou participação
- votar em propostas de governança simplificada

Esse fluxo ajuda a ilustrar como um protocolo Web3 pode unir incentivo econômico, reputação digital e governança comunitária.

## Contratos inteligentes

### 1. `EduToken.sol`

Contrato ERC-20 baseado em OpenZeppelin.

Responsabilidades:

- cria o token `EduToken`
- símbolo: `EDU`
- mint inicial para o deployer
- função `mint` restrita ao owner

Uso principal:

- staking
- recompensas
- votação na DAO

### 2. `EduBadgeNFT.sol`

Contrato ERC-721 baseado em OpenZeppelin.

Responsabilidades:

- cria o NFT `EduBadge`
- símbolo: `EDB`
- mint controlado pelo owner
- suporte simples a `tokenURI`

Uso principal:

- representar conquistas, certificados, participação em eventos ou marcos acadêmicos

### 3. `PriceConsumer.sol`

Contrato de leitura de dados externos via Chainlink.

Responsabilidades:

- receber no construtor o endereço do aggregator
- consultar o preço ETH/USD
- expor função pública `getLatestPrice`

Uso principal:

- permitir que o staking demonstre dependência de dado externo

### 4. `Staking.sol`

Contrato de staking do token `EDU`.

Responsabilidades:

- permitir stake de tokens
- permitir unstake
- calcular recompensas lineares simples
- consultar o oracle para ajustar levemente o APY
- manter reserva de recompensas financiada pelo owner

Lógica simplificada de recompensa:

- APY base de 10%
- se ETH/USD estiver acima de 3000, aplica pequeno bônus
- se ETH/USD estiver em 1500 ou menos, aplica pequeno desconto
- caso o oracle falhe, o contrato usa a taxa base

### 5. `SimpleDAO.sol`

Contrato de governança simples para fins didáticos.

Responsabilidades:

- criar propostas
- votar `sim` ou `não`
- usar saldo atual de `EDU` como poder de voto
- registrar prazo de votação e status de execução

Observação:

- o contrato marca uma proposta como executada, mas não executa payload arbitrário on-chain

### 6. `MockV3Aggregator.sol`

Contrato auxiliar para testes locais.

Responsabilidades:

- simular um price feed compatível com o fluxo do `PriceConsumer`
- permitir testes sem depender da Chainlink em rede real

## Tecnologias utilizadas

- Solidity `^0.8.20`
- Hardhat
- ethers.js
- OpenZeppelin Contracts
- Chainlink Contracts
- Sepolia Testnet

## Requisitos

Antes de começar, tenha instalado:

- Node.js 18+ ou superior
- npm
- uma carteira com ETH de teste na Sepolia

## Instalação

Clone o projeto e instale as dependências:

```bash
npm install
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/SUA_CHAVE
PRIVATE_KEY=0xSUA_CHAVE_PRIVADA
ETHERSCAN_API_KEY=SUA_CHAVE_ETHERSCAN
CHAINLINK_AGGREGATOR=0x694AA1769357215DE4FAC081bf1f309aDC325306
INITIAL_REWARD_POOL=100000
NFT_ADDRESS=0xSeuContratoNFT
NFT_RECIPIENT=0xCarteiraDestino
NFT_TOKEN_URI=https://example.com/metadata/edubadge-1.json
TOKEN_ADDRESS=0xSeuContratoToken
STAKING_ADDRESS=0xSeuContratoStaking
STAKE_AMOUNT=100
DAO_ADDRESS=0xSeuContratoDAO
DAO_ACTION=create
PROPOSAL_TITLE=Nova badge para finalistas
PROPOSAL_DESCRIPTION=Proposta academica para emitir uma nova badge
PROPOSAL_DURATION=86400
PROPOSAL_ID=1
VOTE_SUPPORT=true
```

Observações:

- `CHAINLINK_AGGREGATOR` pode ser configurado manualmente para o feed ETH/USD desejado
- `INITIAL_REWARD_POOL` é usado no deploy para financiar a reserva inicial do staking
- variáveis de script podem ser definidas antes de rodar `mintNFT.js`, `stake.js` e `vote.js`

## Compilação

Para compilar os contratos:

```bash
npm run compile
```

## Testes

Para executar os testes:

```bash
npm test
```

Os testes cobrem:

- deploy do token
- mint de NFT
- fluxo básico de staking
- criação de proposta
- votação na DAO

## Deploy na Sepolia

Com o `.env` configurado, rode:

```bash
npm run deploy:sepolia
```

Fluxo do deploy:

1. deploy do `EduToken`
2. deploy do `EduBadgeNFT`
3. deploy do `PriceConsumer`
4. deploy do `Staking`
5. deploy do `SimpleDAO`
6. aprovação e funding inicial do pool de recompensas do staking

Ao final, o script imprime todos os endereços dos contratos.

## Execução dos scripts

### Mintar NFT

```bash
npm run mint:nft
```

### Fazer stake

```bash
npm run stake
```

O script:

1. aprova o uso dos tokens pelo contrato de staking
2. envia a transação de stake

### Criar proposta ou votar

```bash
npm run vote
```

Comportamento:

- se `DAO_ACTION=create`, cria uma nova proposta
- se `DAO_ACTION=vote`, vota na proposta indicada em `PROPOSAL_ID`

## Frontend

O frontend foi redesenhado como um dashboard Web3 premium com:

- sidebar de navegação
- topbar com status de rede e carteira
- hero section com CTA
- KPI cards
- quick actions
- painéis de staking, governança, badges, explorer e atividades
- visual dark futurista com glassmorphism e acentos dourados, ciano e âmbar

Arquivos principais do frontend:

- `frontend/index.html`
- `frontend/styles.css`
- `frontend/config.js`
- `frontend/mock-data.js`
- `frontend/app.js`
- `frontend/assets/logo.svg`

Dados live atualmente suportados:

- conexão MetaMask
- saldo EDU
- saldo de NFTs
- stake atual
- recompensas pendentes
- APY atual
- total staked
- preço ETH/USD via oracle
- mint de NFT
- envio de stake
- voto na DAO

Dados mock ou híbridos:

- badges recentes
- log de atividades
- estatísticas agregadas do protocolo
- propostas, quando não houver conexão/endereço configurado

Para usar:

1. faça o deploy dos contratos
2. abra o frontend por um servidor local
3. preencha os endereços na seção `Explorer e contratos`
4. salve a configuração local
5. conecte a MetaMask na mesma rede

### Servidor local do frontend

Abra o dashboard via HTTP (MetaMask normalmente não injeta provider em `file://`).

Em um terminal:

```bash
cd frontend
npm run dev
```

Depois acesse `http://127.0.0.1:5173`.

Detalhamento adicional da camada visual está em `frontend/README.md`.

## Como as partes se conectam

- `EduToken` é o ativo central do protocolo
- `Staking` recebe `EDU` e distribui recompensas em `EDU`
- `PriceConsumer` lê o preço ETH/USD e influencia levemente o APY do staking
- `SimpleDAO` usa o saldo de `EDU` como poder de voto
- `EduBadgeNFT` permite emitir badges para usuários da plataforma
- scripts e frontend interagem com os contratos usando `ethers.js`

## Observações de segurança

Este projeto aplica boas práticas básicas:

- `Ownable` para funções administrativas
- `ReentrancyGuard` no staking
- `SafeERC20` para transferências seguras
- validações de entrada com `require`
- separação entre principal em stake e reserva de recompensas

Ainda assim, por ser um MVP acadêmico:

- não há snapshot de votos
- não há quórum
- não há execução avançada de propostas
- não há modelagem econômica de produção

## Ordem rápida de uso

### Rodar local (recomendado para desenvolvimento)

Em um terminal (na raiz):

```bash
npm install
npm run compile
npm run node
```

Em outro terminal (na raiz), faça o deploy na rede local:

```bash
npm run deploy:local
```

Suba o frontend:

```bash
npm run frontend:dev
```

Acesse `http://127.0.0.1:5173`, conecte a MetaMask na rede Localhost `8545` (chainId `31337`) e cole os endereços do deploy em "Explorer e contratos".

### Rodar na Sepolia

1. instalar dependências com `npm install`
2. configurar `.env`
3. compilar com `npm run compile`
4. testar com `npm test`
5. fazer deploy com `npm run deploy:sepolia`
6. preencher os endereços nos scripts ou no frontend
7. interagir com `mint:nft`, `stake`, `vote` ou `frontend/index.html`

## Licença

MIT
