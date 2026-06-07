import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsService, eventItemsService } from "@/services/events.service";
import { useAuthStore } from "@/store/auth.store";
import type { EventFormData, CartItem } from "@/types";

export function useEvents() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const events = useQuery({
    queryKey: ["events"],
    queryFn: () => eventsService.getAll(),
    enabled: !!user,
  });

  const createEvent = useMutation({
    mutationFn: ({
      formData,
      items,
    }: {
      formData: EventFormData;
      items: CartItem[];
    }) => eventsService.create(formData, items, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });

  const deleteEvent = useMutation({
    mutationFn: (id: string) => eventsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });

  return {
    events: events.data ?? [],
    isLoading: events.isLoading,
    createEvent,
    deleteEvent,
  };
}

export function useEventDetail(eventId: string) {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const event = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => eventsService.getById(eventId),
    enabled: !!eventId && !!user,
  });

  const items = useQuery({
    queryKey: ["event-items", eventId],
    queryFn: () => eventItemsService.getByEvent(eventId),
    enabled: !!eventId,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["event-items", eventId] });
    qc.invalidateQueries({ queryKey: ["event", eventId] });
  };

  const toggleSeparated = useMutation({
    mutationFn: ({ id, separated }: { id: string; separated: boolean }) =>
      eventItemsService.toggleSeparated(id, separated),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["event-items", eventId] }),
  });

  const confirmItem = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      eventItemsService.confirmItem(id, quantity),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["event-items", eventId] }),
  });

  const markMissing = useMutation({
    mutationFn: ({
      id,
      justification,
    }: {
      id: string;
      justification: string;
    }) => eventItemsService.markMissing(id, justification),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["event-items", eventId] }),
  });

  const resolveMissing = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      eventItemsService.resolveMissing(id, quantity),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["event-items", eventId] }),
  });

  const addItems = useMutation({
    mutationFn: (items: CartItem[]) =>
      eventItemsService.addItems(eventId, items, user!.id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["event-items", eventId] }),
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => eventItemsService.deleteItem(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["event-items", eventId] }),
  });

  const updateQuantity = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      eventItemsService.updateQuantity(id, quantity),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["event-items", eventId] }),
  });

  return {
    event: event.data,
    items: items.data ?? [],
    isLoading: event.isLoading || items.isLoading,
    invalidate,
    toggleSeparated,
    confirmItem,
    markMissing,
    resolveMissing,
    addItems,
    deleteItem,
    updateQuantity,
  };
}
