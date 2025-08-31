# MyFEU - Instruções de Implementação e Regras de Negócio

## Visão Geral

O MyFEU é um assistente pessoal que centraliza múltiplas atividades e informações do cotidiano em um único front-end, altamente personalizável. O usuário pode adicionar, configurar e visualizar diversos widgets, agrupando o que é relevante para sua rotina em cards independentes e flexíveis.

---

## Protótipo e Layout

- O front-end segue um modelo de dashboard em grid, inspirado no protótipo oficial, com cards/widgets organizados por temas.
- Informações contextuais (localidade, temperatura, data/hora) ficam no topo da tela.
- Cada card representa um widget, podendo ser configurado pelo usuário e exibindo dados específicos.
- Exemplo de widgets:
  - Notícias
  - Lista de Compras
  - Lembretes
  - Alertas Redes Sociais
  - Repositório
  - Saúde
  - Contas e Pagamentos
  - Bolsa de Valores
  - Atalhos
  - Jogos e Resultados
  - Ideias (IA)
  - Ferramentas (calculadora, relógio, alarme, calendário)

---

## Regras de Negócio

### 1. Personalização de Dashboard
- O usuário pode adicionar, remover, editar, reorganizar e configurar widgets/cards.
- Cada usuário possui seu próprio layout e configuração de widgets, persistidos no banco de dados.

### 2. Widgets e Dados
- Cada widget tem seu tipo, configuração e dados associados, podendo consumir APIs externas ou armazenar informações customizadas.
- Os dados de cada widget são salvos e consultados individualmente.

### 3. Segurança e Autenticação
- Usuários cadastram-se via email e senha (hash seguro).
- Autenticação é obrigatória para acessar e personalizar o dashboard.
- Recomenda-se JWT para sessões e OAuth2 para integrações externas.

### 4. UX Responsiva e Acessível
- Grid e Breakpoints

- Definição de colunas por breakpoint:
sm (≤ 640px): 1 coluna
md (641–1024px): 6 colunas (máx. 2 widgets por linha)
lg (≥ 1025px): 12 colunas (máx. 3 widgets por linha)
Gutters: 16px (horizontal e vertical).
Alinhamento: compactação vertical, sem sobreposição.

- Tamanhos por Widget
Para cada tipo de widget: minW, minH, defaultW, defaultH, maxW por breakpoint.
Ex.: KPI (minW=3,minH=2,default=3x2,maxW=4); Chart (minW=4,minH=3,default=4x3,maxW=4).
Comportamento de Adição

- Botão “+” abre modal com:
Lista de widgets (nome, descrição, ícone, prévia)

- Busca e categorias
Config inicial (Devemos iniciar o sistema somente com um espaço pre-definido, com a opção de incluir Widgets)
Ao adicionar: inserir na primeira posição livre da grade da linha atual, respeitando limite por linha.
E deixar mais um elemento fixo na proxima posição para o usuário poder adicionar o segundo Widget.

- Drag, Resize e Teclado
Drag handle no header do card.
Resize handle no canto inferior direito.
Teclado: setas movem; Shift+setas redimensionam; Enter ativa modo mover; Esc cancela.
Anunciar ações por aria-live.

- Persistência
Persistir layout por usuário no localStorage (chave padronizada) e, se disponível, em endpoint:
GET /api/dashboard/layout
PUT /api/dashboard/layout
Debounce 300ms para evitar excesso de chamadas.

- Acessibilidade e Semântica
Roles: region/tabpanel conforme contexto; aria-label com nome do widget.
Foco visível e ordem lógica.
Modal acessível (focus trap, aria-modal, Esc).
Contraste mínimo WCAG AA (4.5:1).

- Estados de UI
Empty state: instrução para adicionar widgets.
Loading: skeletons nos widgets que dependem de dados.
Error state: fallback com retry.
Limite por linha atingido: feedback sutil ao tentar expandir além do permitido.

- Performance
Debounce/throttle em drag/resize.
Virtualização opcional se houver muitos widgets.
Lazy loading de widgets por demanda (code-splitting).

- Design System
Tokens de espaço, cores, radius e sombras padronizados.
Suporte a tema claro/escuro.
Telemetria (opcional)
Eventos: widget_added, widget_removed, moved, resized, layout_saved.

- Segurança
Validar registro de widgets (lista whitelisted).
Sanitizar conteúdo dinâmico.

- Testes
E2E (ex.: Playwright) cobrindo adicionar/mover/redimensionar/persistir.
Unitários para utilitários de layout e persistência.
A11y (axe) básico no Dashboard.

### 5. Extensibilidade
- Widgets são modularizados, permitindo fácil expansão com novos tipos.
- APIs e banco de dados modelados para suportar múltiplos tipos de dados/configurações.

### 6. Boas Práticas Técnicas

#### Backend (Python + FastAPI)
- Utilizar SQLAlchemy para ORM.
- Separar modelos, schemas, operações (CRUD) e rotas.
- Validar dados de entrada via Pydantic.
- Utilizar variáveis de ambiente para credenciais sensíveis.
- Tratar erros e exceções corretamente nas APIs.
- Utilizar versionamento de APIs se necessário.

#### Banco de Dados (MySQL)
- Normalizar tabelas para evitar redundâncias.
- Utilizar tipos adequados para cada campo (VARCHAR, JSON, DATETIME).
- Implementar relacionamentos via Foreign Keys.
- Salvar configurações e dados dos widgets por usuário.

#### Front-end (React)
- Utilizar componentes funcionais e hooks.
- Estruturar o dashboard com CSS Grid conforme o modelo visual.
- Cada WidgetCard deve ser independente e receber props dinâmicas.
- Chamar APIs via Axios ou Fetch, tratar estados de carregamento/erro.
- Adotar boas práticas de acessibilidade (alt em imagens, labels em inputs).
- Utilizar bibliotecas de UI para padronização visual.

#### Integração de APIs Externas
- Consumir APIs via backend e/ou frontend conforme necessidade.
- Utilizar cache para dados que mudam pouco (ex: cotações).
- Tratar limites e erros das APIs externas.

#### Segurança
- Nunca expor dados sensíveis no frontend.
- Utilizar HTTPS em produção.
- Implementar validação de permissões por usuário.

#### Documentação e Organização
- Manter documentação atualizada (este arquivo, README, comentários no código).
- Adotar convenções de nomenclatura para arquivos e variáveis.
- Versionar adequadamente o projeto utilizando Git.

---

## Estrutura Recomendada

```
myfeu/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── crud.py
│   │   ├── database.py
│   │   ├── schemas.py
│   │   └── widgets_catalog.json
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Dashboard.jsx
│   │   ├── WidgetCard.jsx
│   │   ├── AddWidgetModal.jsx
│   │   ├── api.js
│   │   └── styles.css
│   ├── package.json
│   └── README.md
└── instructions_myfeu.md
```

---

## Instruções para Expansão

- Para adicionar um novo widget, crie um modelo e API correspondente, insira no `widgets_catalog.json` e na tabela `widgets`.
- Para expandir funcionalidades, utilize boas práticas de modularização e mantenha as regras de negócio centralizadas neste arquivo.
- Para personalização avançada, utilize configurações JSON nos cards/widgets, permitindo que o usuário ajuste preferências.

---

## Referências

- Protótipo visual oficial: "C:\Users\rodri\OneDrive\HubCode\MyFEU\MyFEU - Prototipo 1.jpg"
- Documentação FastAPI: https://fastapi.tiangolo.com/
- Documentação React: https://react.dev/
- Documentação SQLAlchemy: https://docs.sqlalchemy.org/
- Guia de boas práticas de UI: https://material.io/design

---

## Observações Finais

Este documento centraliza as regras, práticas e orientações para o desenvolvimento do MyFEU. Utilize-o como referência principal para decisões técnicas e validação de requisitos. Adapte e expanda conforme evolução do projeto e feedback dos usuários.
