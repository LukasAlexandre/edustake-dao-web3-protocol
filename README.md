# EduStake DAO Web3 Protocol

MVP de um protocolo Web3 desenvolvido para fins acadêmicos, integrando os principais componentes de uma aplicação descentralizada moderna.

## Objetivo

Este projeto foi criado para consolidar conhecimentos avançados em Web3 por meio da construção de um protocolo descentralizado funcional com deploy em testnet.

O protocolo reúne:

- Token ERC-20
- NFT ERC-721
- Contrato de Staking com recompensa
- Governança simplificada (DAO)
- Integração com oráculo
- Integração com backend/script Web3
- Deploy em testnet Ethereum

## Problema que o projeto resolve

O projeto propõe uma solução simples para incentivar participação, retenção e engajamento em comunidades ou plataformas educacionais descentralizadas.

A lógica funciona assim:

- usuários recebem tokens;
- podem bloquear esses tokens em staking;
- recebem recompensas;
- conquistam NFTs;
- participam de votações da comunidade.

## Arquitetura do projeto

### Contratos principais

- `EduToken.sol`  
  Token ERC-20 utilizado para recompensas, staking e governança.

- `EduBadgeNFT.sol`  
  NFT ERC-721 utilizado para representar conquistas, badges ou marcos de participação.

- `Staking.sol`  
  Contrato responsável pelo staking de tokens e distribuição de recompensas.

- `SimpleDAO.sol`  
  Contrato de governança simplificada para criação e votação de propostas.

- `PriceConsumer.sol`  
  Contrato responsável por consumir dados externos via oráculo.

## Tecnologias utilizadas

- Solidity `^0.8.x`
- OpenZeppelin
- Hardhat
- ethers.js
- Chainlink
- Sepolia Testnet

## Funcionalidades esperadas

- criação e transferência de token ERC-20
- mint de NFT
- depósito de tokens em staking
- cálculo e distribuição de recompensa
- criação de propostas
- votação em DAO
- leitura de preço externo via oráculo
- deploy em testnet

## Segurança

Este projeto busca aplicar boas práticas básicas de segurança em contratos inteligentes, incluindo:

- controle de acesso
- proteção contra reentrancy
- validações com `require`
- uso de Solidity `^0.8.x`

Além disso, será acompanhado por auditoria simples com ferramentas como:

- Slither
- Mythril
- Hardhat

## Estrutura inicial do projeto

```bash
edustake-dao-web3-protocol/
├── contracts/
├── scripts/
├── test/
├── audit/
├── frontend/
├── README.md
├── hardhat.config.js
└── package.json
