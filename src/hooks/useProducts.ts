import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import {
  productsService,
  categoriesService,
  locationsService,
} from "@/services/products.service";
import { useAuthStore } from "@/store/auth.store";
import type { ProductFormData } from "@/types";

export function useProducts() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const productsQuery = useInfiniteQuery({
    queryKey: ["products"],
    queryFn: ({ pageParam = 0 }) =>
      productsService.getAll(pageParam as number, 12),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: !!user,
  });

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesService.getAll(),
    enabled: !!user,
  });

  const locations = useQuery({
    queryKey: ["locations"],
    queryFn: () => locationsService.getAll(),
    enabled: !!user,
  });

  const allProducts = productsQuery.data?.pages.flatMap((p) => p.data) ?? [];

  const createProduct = useMutation({
    mutationFn: (data: ProductFormData) =>
      productsService.create(data, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const updateProduct = useMutation({
    mutationFn: ({
      id,
      data,
      currentImagePath,
    }: {
      id: string;
      data: Partial<ProductFormData>;
      currentImagePath?: string | null;
    }) => productsService.update(id, data, user!.id, currentImagePath),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const deleteProduct = useMutation({
    mutationFn: ({
      id,
      imagePath,
    }: {
      id: string;
      imagePath?: string | null;
    }) => productsService.delete(id, user!.id, imagePath),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });

  const createCategory = useMutation({
    mutationFn: (name: string) => categoriesService.create(name, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });

  const createLocation = useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) => locationsService.create(name, description, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["locations"] }),
  });

  const deleteLocation = useMutation({
    mutationFn: (id: string) => locationsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["locations"] }),
  });

  return {
    products: allProducts,
    categories: categories.data ?? [],
    locations: locations.data ?? [],
    isLoadingProducts: productsQuery.isLoading,
    isFetchingNextPage: productsQuery.isFetchingNextPage,
    hasNextPage: productsQuery.hasNextPage,
    fetchNextPage: productsQuery.fetchNextPage,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    deleteCategory,
    createLocation,
    deleteLocation,
  };
}
