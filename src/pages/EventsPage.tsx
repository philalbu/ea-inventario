import { useState } from "react";
import {
  Plus,
  Calendar,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  Users,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { useEvents } from "@/hooks/useEvents";
import { useProducts } from "@/hooks/useProducts";
import { useResponsibles } from "@/hooks/useResponsibles";
import { EventForm } from "@/components/events/EventForm";
import { useNavigate } from "react-router-dom";
import type { AppEvent, CartItem, EventFormData } from "@/types";

const statusConfig = {
  pending: {
    label: "Aguardando",
    color: "bg-gray-100 text-gray-600",
    icon: Clock,
  },
  separating: {
    label: "Separando",
    color: "bg-blue-100 text-blue-700",
    icon: Package,
  },
  separated: {
    label: "Separado",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  confirming: {
    label: "Conferindo",
    color: "bg-amber-100 text-amber-700",
    icon: AlertCircle,
  },
  completed: {
    label: "Concluído",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  has_issues: {
    label: "Com Pendências",
    color: "bg-red-100 text-red-700",
    icon: AlertCircle,
  },
};

export function EventsPage() {
  const navigate = useNavigate();
  const { events, isLoading, createEvent, deleteEvent } = useEvents();
  const { products } = useProducts();
  const { responsibles } = useResponsibles();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<AppEvent | null>(null);

  const handleCreate = async (formData: EventFormData, items: CartItem[]) => {
    const resp = responsibles.find((r) => r.id === formData.responsible_id);
    await createEvent.mutateAsync({
      formData: { ...formData, responsible_name: resp?.name },
      items,
    });
    setIsCreateOpen(false);
  };

  const formatDate = (date: string) =>
    new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const isDatePast = (date: string) =>
    new Date(date + "T23:59:59") < new Date();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {events.length} evento{events.length !== 1 ? "s" : ""} cadastrado
            {events.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Evento</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Nenhum evento cadastrado</p>
          <p className="text-sm text-gray-400 mt-1">
            Crie um evento para começar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const status = statusConfig[event.status];
            const StatusIcon = status.icon;
            const past = isDatePast(event.event_date);

            return (
              <div
                key={event.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center justify-between gap-4 ${
                  past && event.status !== "completed"
                    ? "border-amber-200"
                    : "border-gray-100"
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      past && event.status !== "completed"
                        ? "bg-amber-50"
                        : "bg-primary-50"
                    }`}
                  >
                    <Calendar
                      className={`h-6 w-6 ${
                        past && event.status !== "completed"
                          ? "text-amber-500"
                          : "text-primary-600"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {event.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(event.event_date)}
                    </p>
                    {event.responsible_name && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Users className="h-3 w-3" />
                        {event.responsible_name}
                      </p>
                    )}
                    {past && event.status !== "completed" && (
                      <p className="text-xs text-amber-600 font-medium mt-0.5">
                        ⚠️ Evento passou — conferir itens
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeletingEvent(event)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Novo Evento"
        size="lg"
      >
        <EventForm
          products={products}
          responsibles={responsibles}
          onSubmit={handleCreate}
          onCancel={() => setIsCreateOpen(false)}
          isSubmitting={createEvent.isPending}
        />
      </Modal>

      <Modal
        isOpen={!!deletingEvent}
        onClose={() => setDeletingEvent(null)}
        title="Remover Evento"
        size="sm"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              Remover "{deletingEvent?.name}"?
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Todos os itens do evento serão removidos.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => setDeletingEvent(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              isLoading={deleteEvent.isPending}
              onClick={async () => {
                await deleteEvent.mutateAsync(deletingEvent!.id);
                setDeletingEvent(null);
              }}
            >
              Remover
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
