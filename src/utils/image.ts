/**
 * Retorna URL otimizada do Supabase com resize e compressão automática.
 * Docs: https://supabase.com/docs/guides/storage/serving/image-transformations
 */
export function getOptimizedImageUrl(
  url: string | null,
  options: { width?: number; height?: number; quality?: number } = {},
): string | null {
  if (!url) return null;

  const { width = 400, height = 400, quality = 75 } = options;

  // Só aplica transformação em URLs do Supabase Storage
  if (!url.includes("/storage/v1/object/public/")) return url;

  // Troca /object/public/ por /render/image/public/ e adiciona parâmetros
  const optimized = url.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/",
  );

  return `${optimized}?width=${width}&height=${height}&quality=${quality}&resize=cover`;
}

/**
 * Para thumbnails pequenos (cards, tabelas)
 */
export function getThumbnailUrl(url: string | null): string | null {
  return getOptimizedImageUrl(url, { width: 400, height: 400, quality: 70 });
}

/**
 * Para preview grande (modal de edição)
 */
export function getPreviewUrl(url: string | null): string | null {
  return getOptimizedImageUrl(url, { width: 800, height: 800, quality: 85 });
}
