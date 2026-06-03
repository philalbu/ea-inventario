-- ============================================================
-- INVENTÁRIO PRO - Schema do Banco de Dados
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(name, user_id)
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  category_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'low_stock')),
  image_url TEXT,
  image_path TEXT,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas para categories
CREATE POLICY "categories_select_own" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "categories_insert_own" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories_update_own" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "categories_delete_own" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para products
CREATE POLICY "products_select_own" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "products_insert_own" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "products_update_own" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "products_delete_own" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Storage Bucket para imagens de produtos
-- ============================================================
-- Execute também no SQL Editor:

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "product_images_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "product_images_insert_auth" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "product_images_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- Categorias padrão (serão criadas ao registrar o usuário)
-- ============================================================
-- As categorias são criadas via aplicação no primeiro login
