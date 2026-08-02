# Galego — Depósito de Bebidas

Catálogo de bebidas moderno construído com Next.js 14, TypeScript e Redis (Upstash), pronto para deploy na Vercel.

## 🚀 Tecnologias

- **Next.js 14** (App Router) - Framework React
- **TypeScript** - Tipagem estática
- **Redis (Upstash)** - Banco de dados via Vercel Marketplace
- **TailwindCSS** - Estilização
- **Lucide React** - Ícones
- **bcryptjs** - Hash de senhas

## 📋 Funcionalidades

- **Catálogo Público**: Listagem de produtos com busca, categorias, destaques e mais vendidos
- **Carrinho de Compras**: Gerenciamento de carrinho com drawer UI
- **Checkout**: Geração de pedido formatado para WhatsApp
- **Cupons de Desconto**: Sistema de cupons com validação no servidor
- **Painel Admin**: Gestão completa de produtos, categorias, cupons e configurações
- **Segurança**: Autenticação de admin com cookies httpOnly e middleware de proteção

## 🛠️ Como Rodar Localmente

### Pré-requisitos

- Node.js 18+ instalado
- Conta na Vercel (para Redis Upstash)

### Instalação

1. **Clone o repositório** (ou navegue até o diretório do projeto):
   ```bash
   cd app-bebidas
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure o Redis Upstash**:
   
   a. Acesse [Vercel Marketplace](https://vercel.com/marketplace)
   
   b. Instale a integração "Upstash Redis"
   
   c. Após a instalação, a Vercel injetará automaticamente as variáveis de ambiente:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

4. **Configure as variáveis de ambiente**:
   
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   KV_REST_API_URL=sua_url_do_upstash
   KV_REST_API_TOKEN=seu_token_do_upstash
   ADMIN_PASSWORD=sua_senha_admin
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Rode o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

6. **Popule o banco de dados** (opcional - para dados de teste):
   
   Faça uma requisição POST para `http://localhost:3000/api/seed`:
   ```bash
   curl -X POST http://localhost:3000/api/seed
   ```

   Isso irá criar categorias, produtos e cupons de exemplo.

7. **Acesse a aplicação**:
   - Catálogo público: `http://localhost:3000`
   - Painel admin: `http://localhost:3000/admin`

## 🌐 Deploy na Vercel

### Passo a Passo

1. **Push do código para o GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/seu-usuario/galego-bebidas.git
   git push -u origin main
   ```

2. **Importe o projeto na Vercel**:
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Add New Project"
   - Importe o repositório do GitHub

3. **Configure o Redis**:
   - Durante o setup do projeto, clique em "Storage" → "Upstash Redis"
   - Ou acesse as configurações do projeto → "Storage" → "Upstash Redis"
   - A Vercel irá automaticamente injetar as env vars necessárias

4. **Configure variáveis de ambiente adicionais** (se necessário):
   - `ADMIN_PASSWORD`: Sua senha do admin (opcional - será definida no primeiro login)
   - `NEXT_PUBLIC_APP_URL`: URL do seu projeto na Vercel

5. **Deploy**:
   - Clique em "Deploy"
   - Aguarde o build e deploy completarem

6. **Popule o banco de dados**:
   - Após o deploy, acesse `https://seu-projeto.vercel.app/api/seed`
   - Ou use curl: `curl -X POST https://seu-projeto.vercel.app/api/seed`

## 🔐 Trocar Senha do Admin

### Primeiro Acesso

1. Acesse `/admin`
2. Digite qualquer senha no primeiro login
3. A senha será automaticamente hasheada e salva no Redis

### Trocar Senha Posteriormente

Para trocar a senha do admin, você tem duas opções:

**Opção 1: Via Env Var (recomendado para primeiro setup)**
- Defina `ADMIN_PASSWORD` no `.env.local` ou nas configurações da Vercel
- No primeiro login, use essa senha
- Ela será automaticamente hasheada e salva

**Opção 2: Via Redis (avançado)**
- Acesse o console do Upstash Redis
- Delete a chave `config`
- Faça login novamente com a nova senha
- Ela será hasheada e salva

## 📁 Estrutura do Projeto

```
app-bebidas/
├── app/
│   ├── admin/
│   │   ├── page.tsx              # Login admin
│   │   └── dashboard/
│   │       └── page.tsx          # Painel admin completo
│   ├── api/
│   │   ├── admin/
│   │   │   ├── login/route.ts    # Login API
│   │   │   └── logout/route.ts   # Logout API
│   │   ├── categories/          # CRUD categorias
│   │   ├── config/              # Configurações
│   │   ├── coupons/             # CRUD cupons + validação
│   │   ├── products/            # CRUD produtos
│   │   └── seed/                # Seed de dados
│   ├── globals.css              # Estilos globais
│   ├── layout.tsx               # Layout root
│   └── page.tsx                 # Página inicial (catálogo)
├── components/
│   ├── ui/                      # Componentes UI reutilizáveis
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── CategoryCard.tsx         # Card de categoria
│   ├── CheckoutModal.tsx        # Modal de checkout
│   ├── ProductCard.tsx          # Card de produto
│   └── ShoppingCart.tsx         # Carrinho de compras
├── lib/
│   ├── auth.ts                  # Autenticação e sessões
│   ├── db.ts                    # Acesso ao Redis
│   ├── redis.ts                 # Cliente Redis
│   └── utils.ts                 # Utilitários
├── types/
│   └── index.ts                 # Tipos TypeScript
├── middleware.ts                # Middleware de proteção
├── .env.example                 # Exemplo de env vars
├── package.json                 # Dependências
├── tailwind.config.ts           # Config Tailwind
├── tsconfig.json                # Config TypeScript
└── README.md                   # Este arquivo
```

## 🔧 API Routes

### Públicas
- `GET /api/products` - Listar produtos
- `GET /api/categories` - Listar categorias
- `GET /api/config` - Obter configurações
- `POST /api/coupons/validate` - Validar cupom

### Protegidas (requer admin)
- `POST /api/products` - Criar produto
- `PUT /api/products/[id]` - Atualizar produto
- `DELETE /api/products/[id]` - Deletar produto
- `POST /api/categories` - Criar categoria
- `PUT /api/categories/[id]` - Atualizar categoria
- `DELETE /api/categories/[id]` - Deletar categoria
- `POST /api/coupons` - Criar cupom
- `PUT /api/coupons/[id]` - Atualizar cupom
- `DELETE /api/coupons/[id]` - Deletar cupom
- `PUT /api/config` - Atualizar configurações

## 🎨 Personalização

### Cores e Tema

As cores principais podem ser alteradas em `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    DEFAULT: '#FF6B00',    // Laranja principal
    dark: '#E65A00',        // Laranja escuro
    light: '#FF8533',       // Laranja claro
  },
  dark: {
    bg: '#0A0A0A',          // Fundo escuro
    card: '#141414',        // Card
    border: '#262626',      // Borda
    text: '#FAFAFA',        // Texto
    muted: '#A3A3A3',       // Texto secundário
  },
}
```

### Fontes

As fontes são configuradas em `app/layout.tsx`:
- **Anton** - Títulos
- **Manrope** - Texto corpo
- **Space Mono** - Monoespaçado

## 📝 Notas Importantes

- **Carrinho**: O carrinho fica no client (React state/localStorage) - apenas produtos, categorias, cupons e config ficam no Redis
- **Segurança**: A senha do admin nunca é enviada para o client - apenas hash é armazenado
- **Imagens**: Use URLs de imagens externas (Unsplash, etc.) ou configure um serviço de upload
- **WhatsApp**: O número deve estar no formato internacional (ex: 5511999999999)

## 🐛 Troubleshooting

### Erro "Missing Redis environment variables"
- Verifique se `KV_REST_API_URL` e `KV_REST_API_TOKEN` estão configurados
- Na Vercel, verifique se a integração Upstash Redis está instalada

### Erro 401 nas rotas de admin
- Verifique se você está logado
- Cookies devem estar habilitados no navegador
- Verifique o middleware para garantir que está funcionando

### Produtos não aparecem
- Execute o seed: `POST /api/seed`
- Verifique se o Redis está conectado
- Confirme que os produtos estão marcados como `available: true`

## 📄 Licença

Este projeto é fornecido como está para uso pessoal e comercial.

## 🤝 Suporte

Para questões ou problemas, verifique a documentação ou abra uma issue no repositório.
#   a l c o o l  
 "# galego-bebidas" 
