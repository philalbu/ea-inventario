import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { responsiblesService } from "@/services/responsibles.service";
import { useAuthStore } from "@/store/auth.store";

export function useResponsibles() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const responsibles = useQuery({
    queryKey: ["responsibles", user?.id],
    queryFn: () => responsiblesService.getAll(user!.id),
    enabled: !!user,
  });

  const createResponsible = useMutation({
    mutationFn: ({
      name,
      phone,
      email,
    }: {
      name: string;
      phone: string;
      email: string;
    }) => responsiblesService.create(name, phone, email, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["responsibles"] }),
  });

  const updateResponsible = useMutation({
    mutationFn: ({
      id,
      name,
      phone,
      email,
    }: {
      id: string;
      name: string;
      phone: string;
      email: string;
    }) => responsiblesService.update(id, name, phone, email, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["responsibles"] }),
  });

  const deleteResponsible = useMutation({
    mutationFn: (id: string) => responsiblesService.delete(id, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["responsibles"] }),
  });

  return {
    responsibles: responsibles.data ?? [],
    isLoading: responsibles.isLoading,
    createResponsible,
    updateResponsible,
    deleteResponsible,
  };
}
