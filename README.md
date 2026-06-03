# Inventário Pro 📦

Sistema de gestão de inventário com identidade visual vermelha/branca.

---

## 🚀 INSTALAÇÃO PASSO A PASSO

### PASSO 1 — Instalar Node.js

1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS** (ex: 20.x)
3. Execute o instalador e siga os passos
4. Após instalar, abra o **Prompt de Comando** e verifique:
   ```
   node -v
   npm -v
   ```

---

### PASSO 2 — Configurar o Supabase (banco de dados gratuito)

O Supabase é **gratuito** e guarda seus dados na nuvem — acessível de qualquer dispositivo.

1. Acesse https://supabase.com e crie uma conta (gratuita)
2. Clique em **"New Project"**
3. Preencha:
   - Nome: `inventario-pro`
   - Senha: qualquer senha forte (guarde!)
   - Região: South America (São Paulo) se disponível
4. Aguarde o projeto criar (~2 minutos)
5. Vá em **SQL Editor** (menu lateral) e cole todo o conteúdo do arquivo `supabase/schema.sql` e clique em **Run**
6. Vá em **Project Settings → API** e copie:
   - **Project URL** (ex: `https://xyzxyz.supabase.co`)
   - **anon / public key** (chave longa)

---

### PASSO 3 — Criar o usuário de login no Supabase

1. No painel do Supabase, vá em **Authentication → Users**
2. Clique em **"Add user" → "Create new user"**
3. Preencha:
   - Email: `ederson.albuquerque@inventariopro.app`
   - Password: `1234`
   - ✅ Marque "Auto Confirm User"
4. Clique em **Create User**

---

### PASSO 4 — Configurar o projeto

1. Abra a pasta `inventory-system` no VS Code ou Explorer
2. Crie um arquivo chamado `.env.local` (na raiz da pasta) com o conteúdo:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA-CHAVE-ANON-AQUI
```

Substitua pelos valores copiados no Passo 2.

---

### PASSO 5 — Instalar e rodar

Abra o **Prompt de Comando** ou **PowerShell** na pasta do projeto:

```bash
# Entrar na pasta
cd C:\Users\PhilippeAlbuquerque\inventory-system

# Instalar dependências (só precisa fazer uma vez)
npm install

# Iniciar o sistema
npm run dev
```

Acesse no navegador: **http://localhost:5173**

**Login:**
- Usuário: `ederson.albuquerque`
- Senha: `1234`

---

### PASSO 6 — Acessar de outros dispositivos (celular, etc.)

Opção A — **Pelo navegador na mesma rede:**
```bash
npm run dev -- --host
```
Acesse pelo IP mostrado no terminal (ex: `http://192.168.1.10:5173`)

Opção B — **Deploy gratuito na Vercel (recomendado):**
1. Instale o Git e envie o projeto para o GitHub
2. Acesse https://vercel.com e conecte seu repositório
3. Configure as variáveis de ambiente no painel da Vercel
4. Terá uma URL pública (ex: `inventario-pro.vercel.app`) acessível de qualquer lugar

---

## 📁 Estrutura do Projeto

```
inventory-system/
├── src/
│   ├── components/
│   │   ├── common/        # Button, Input, Modal, Badge, Spinner
│   │   ├── layout/        # Sidebar, ProtectedLayout
│   │   └── products/      # ProductCard, ProductTable, ProductForm
│   ├── hooks/             # useAuth, useProducts
│   ├── lib/               # Configuração do Supabase
│   ├── pages/             # LoginPage, ProductsPage, DashboardPage
│   ├── services/          # auth, products, storage
│   ├── store/             # Zustand (auth state)
│   ├── types/             # TypeScript types
│   └── utils/             # Helpers
├── supabase/
│   └── schema.sql         # SQL para criar as tabelas
└── .env.local             # Suas credenciais (NÃO commitar)
```

## ✨ Funcionalidades

- ✅ Login com usuário/senha
- ✅ Upload de foto do produto
- ✅ Nome, quantidade, categoria, status, descrição
- ✅ Visualização em cards e tabela
- ✅ Busca e filtros por categoria/status
- ✅ Dashboard com estatísticas
- ✅ Gerenciar categorias
- ✅ Dados salvos no Supabase (acessível de qualquer lugar)
- ✅ Layout responsivo (funciona no celular)
