# Patas de Esperança — Terceira Prática

Projeto de prática em JavaScript com arquitetura de Single Page Application (SPA).

## Estrutura
- `index.html`: shell principal da aplicação.
- `html/`: templates de conteúdo das rotas.
- `css/`: folha de estilos e Design System.
- `imagens/`: recursos gráficos.
- `js/main.js`: roteamento, DOM, eventos, localStorage, máscaras, modal, toast e integração com Alpine.js.
- `vercel.json`: rewrites para as rotas `/projetos` e `/cadastro`.

## Funcionalidades
- Navegação SPA com `history.pushState` e `popstate`.
- Menu hambúrguer responsivo.
- Modal de ajuda.
- Toast de cadastro.
- Máscaras de CPF, telefone e CEP.
- `localStorage` para cadastro e contador de apoios.
- Integração básica com Alpine.js no contador de apoios.
