import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

  const products = useQuery({
    queryKey: ["products", user?.id],
    queryFn: () => productsService.getAll(user!.id),
    enabled: !!user,
  });
  const categories = useQuery({
    queryKey: ["categories", user?.id],
    queryFn: () => categoriesService.getAll(user!.id),
    enabled: !!user,
  });
  const locations = useQuery({
    queryKey: ["locations", user?.id],
    queryFn: () => locationsService.getAll(user!.id),
    enabled: !!user,
  });

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
    mutationFn: (id: string) => categoriesService.delete(id, user!.id),
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
    mutationFn: (id: string) => locationsService.delete(id, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["locations"] }),
  });

  return {
    products: products.data ?? [],
    categories: categories.data ?? [],
    locations: locations.data ?? [],
    isLoadingProducts: products.isLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    deleteCategory,
    createLocation,
    deleteLocation,
  };
}
