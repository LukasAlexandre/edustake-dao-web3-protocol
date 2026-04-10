# Frontend do EduStake DAO

Este frontend foi reorganizado como um dashboard Web3 estático, modular e fácil de evoluir.

## Arquivos principais

- `index.html`
  Shell estrutural da interface, com sidebar, topbar, hero, cards de métricas e seções operacionais.

- `styles.css`
  Design system visual do dashboard.
  Centraliza cores, tipografia, sombras, estados de hover, glassmorphism e responsividade.

- `config.js`
  Configuração inicial do app.
  Define rede esperada, links úteis, chave de `localStorage` e placeholders de contratos.

- `mock-data.js`
  Dados de fallback para propostas, badges, atividades e estatísticas do protocolo.

- `app.js`
  Camada de comportamento.
  Renderiza blocos do dashboard, persiste configuração local, conecta MetaMask e executa as interações Web3.

- `assets/logo.svg`
  Marca visual usada na sidebar.

## Dados live e mock

Atualmente o dashboard suporta dados live para:

- conexão de carteira
- leitura de saldo do token
- leitura de saldo de NFTs
- leitura de stake atual
- leitura de recompensas pendentes
- leitura de APY
- leitura de total staked
- leitura do preço ETH/USD via `PriceConsumer`
- voto na DAO
- stake de tokens
- mint de NFT

Atualmente continuam em modo mock ou híbrido:

- cards de badges recentes
- log de atividades
- estatísticas agregadas do protocolo
- propostas da DAO quando não há endereço configurado ou quando a carteira não está conectada

## Fluxo de uso

1. abrir `frontend/index.html` via servidor local
2. conectar MetaMask
3. preencher os endereços dos contratos em `Explorer e contratos`
4. salvar a configuração
5. usar as seções de NFT, staking e governança

## Observação

Como este projeto é um MVP acadêmico, o frontend foi desenhado para parecer um produto real, mas preserva uma base simples de HTML, CSS e JavaScript puro para facilitar estudo, manutenção e evolução futura.
