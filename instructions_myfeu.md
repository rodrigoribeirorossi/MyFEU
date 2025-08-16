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
- Interface adaptável para desktop e mobile.
- Cards podem crescer ou diminuir conforme o conteúdo.
- Botão "+" para adicionar widgets, com modal de seleção e configuração.
- Layout grid conforme protótipo, com áreas bem definidas e navegação intuitiva.

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
