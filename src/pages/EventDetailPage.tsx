import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Package,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit2,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { useEventDetail } from "@/hooks/useEvents";
import { useProducts } from "@/hooks/useProducts";
import { eventsService } from "@/services/events.service";
import { useAuthStore } from "@/store/auth.store";
import type { EventItem, CartItem } from "@/types";

const statusLabel: Record<string, string> = {
  pending: "Aguardando Separação",
  separating: "Separando Itens",
  separated: "Itens Separados",
  confirming: "Conferindo Pós-Evento",
  completed: "Concluído",
  has_issues: "Com Pendências",
};

interface BaixaItemState {
  selected: boolean;
  isIssue: boolean;
  observation: string;
  quantity: number;
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { products } = useProducts();
  const {
    event,
    items,
    isLoading,
    toggleSeparated,
    confirmItem,
    markMissing,
    resolveMissing,
    addItems,
    deleteItem,
    updateQuantity,
  } = useEventDetail(id!);

  const [isUpdating, setIsUpdating] = useState(false);
  const [missingItem, setMissingItem] = useState<EventItem | null>(null);
  const [justification, setJustification] = useState("");
  const [confirmingItem, setConfirmingItem] = useState<EventItem | null>(null);
  const [confirmQty, setConfirmQty] = useState(1);
  const [resolvingItem, setResolvingItem] = useState<EventItem | null>(null);
  const [resolveQty, setResolveQty] = useState(1);
  const [editingItem, setEditingItem] = useState<EventItem | null>(null);
  const [editQty, setEditQty] = useState(1);
  const [isAddingProducts, setIsAddingProducts] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isBaixaOpen, setIsBaixaOpen] = useState(false);
  const [baixaState, setBaixaState] = useState<Record<string, BaixaItemState>>(
    {},
  );
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [editEventName, setEditEventName] = useState("");
  const [editEventDate, setEditEventDate] = useState("");
  const [editEventNotes, setEditEventNotes] = useState("");
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );

  if (!event)
    return <div className="p-6 text-gray-500">Evento não encontrado.</div>;

  const allSeparated = items.length > 0 && items.every((i) => i.separated);
  const allConfirmed =
    items.length > 0 && items.every((i) => i.confirmed || i.missing);
  const hasMissing = items.some((i) => i.missing);
  const isDatePast = new Date(event.event_date + "T23:59:59") < new Date();
  const canEdit = ["pending", "separating"].includes(event.status);
  const allBaixaProcessed =
    items.length > 0 && items.every((i) => i.baixa_given || i.baixa_issue);
  const showBaixaButton =
    ["separated", "completed", "has_issues"].includes(event.status) &&
    !allBaixaProcessed;

  const openBaixaModal = () => {
    const state: Record<string, BaixaItemState> = {};
    items
      .filter((i) => !i.baixa_given && !i.baixa_issue)
      .forEach((i) => {
        state[i.id] = {
          selected: true,
          isIssue: false,
          observation: "",
          quantity: i.quantity_confirmed ?? i.quantity_requested,
        };
      });
    setBaixaState(state);
    setIsBaixaOpen(true);
  };

  const handleBaixa = async () => {
    setIsUpdating(true);
    const baixaItems = Object.entries(baixaState)
      .filter(([, s]) => s.selected)
      .map(([itemId, s]) => {
        const item = items.find((i) => i.id === itemId)!;
        return {
          itemId,
          productId: item.product_id,
          quantity: s.quantity,
          isIssue: s.isIssue,
          observation: s.observation,
        };
      });

    await eventsService.processBaixa(event.id, user!.id, baixaItems);
    setIsBaixaOpen(false);
    window.location.reload();
  };

  const handleStartSeparating = async () => {
    setIsUpdating(true);
    await eventsService.updateStatus(event.id, "separating", user!.id);
    window.location.reload();
  };

  const handleConfirmSeparation = async () => {
    setIsUpdating(true);
    await eventsService.updateStatus(event.id, "separated", user!.id);
    window.location.reload();
  };

  const handleStartConferring = async () => {
    setIsUpdating(true);
    await eventsService.updateStatus(event.id, "confirming", user!.id);
    window.location.reload();
  };

  const handleFinishEvent = async () => {
    setIsUpdating(true);
    const status = hasMissing ? "has_issues" : "completed";
    await eventsService.updateStatus(event.id, status, user!.id);
    window.location.reload();
  };

  const handleEditEvent = async () => {
    if (!editEventName.trim() || !editEventDate) return;
    setIsSavingEvent(true);
    await eventsService.update(
      event.id,
      { name: editEventName, event_date: editEventDate, notes: editEventNotes },
      user!.id,
    );
    setIsSavingEvent(false);
    setIsEditEventOpen(false);
    window.location.reload();
  };

  const handleMarkMissing = async () => {
    if (!missingItem || !justification.trim()) return;
    await markMissing.mutateAsync({ id: missingItem.id, justification });
    setMissingItem(null);
    setJustification("");
  };

  const handleConfirmItem = async () => {
    if (!confirmingItem) return;
    await confirmItem.mutateAsync({
      id: confirmingItem.id,
      quantity: confirmQty,
    });
    setConfirmingItem(null);
  };

  const handleResolveItem = async () => {
    if (!resolvingItem) return;
    await resolveMissing.mutateAsync({
      id: resolvingItem.id,
      quantity: resolveQty,
    });
    setResolvingItem(null);
  };

  const handleEditQty = async () => {
    if (!editingItem) return;
    await updateQuantity.mutateAsync({ id: editingItem.id, quantity: editQty });
    setEditingItem(null);
  };

  const handleAddProducts = async () => {
    if (cart.length === 0) return;
    await addItems.mutateAsync(cart);
    setCart([]);
    setIsAddingProducts(false);
  };

  const addToCart = (product: (typeof products)[0]) => {
    if (items.find((i) => i.product_id === product.id)) return;
    setCart((prev) => {
      const exists = prev.find((i) => i.product_id === product.id);
      if (exists) return prev;
      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          product_image_url: product.image_url,
          quantity_requested: 1,
        },
      ];
    });
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProduct.toLowerCase()) &&
      !items.find((i) => i.product_id === p.id),
  );

  const getItemBg = (item: EventItem) => {
    if (item.baixa_given) return "bg-green-50";
    if (item.baixa_issue) return "bg-red-50";
    if (item.missing) return "bg-red-50";
    if (item.confirmed) return "bg-green-50";
    return "";
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/events")}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{event.name}</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-gray-500">
              {new Date(event.event_date + "T00:00:00").toLocaleDateString(
                "pt-BR",
                { day: "2-digit", month: "long", year: "numeric" },
              )}
            </p>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              {statusLabel[event.status]}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditEventName(event.name);
              setEditEventDate(event.event_date);
              setEditEventNotes(event.notes ?? "");
              setIsEditEventOpen(true);
            }}
          >
            <Edit2 className="h-4 w-4" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
          {canEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddingProducts(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-5 space-y-2">
        {event.status === "pending" && (
          <Button
            onClick={handleStartSeparating}
            className="w-full"
            isLoading={isUpdating}
          >
            <Package className="h-4 w-4" /> Iniciar Separação dos Itens
          </Button>
        )}
        {event.status === "separating" && !allSeparated && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
            📦 Dê check em todos os itens para confirmar a separação
          </div>
        )}
        {event.status === "separating" && allSeparated && (
          <Button
            onClick={handleConfirmSeparation}
            className="w-full bg-green-600 hover:bg-green-700"
            isLoading={isUpdating}
          >
            <CheckCircle className="h-4 w-4" /> Confirmar — Todos os Itens
            Separados
          </Button>
        )}
        {event.status === "separated" && (
          <div className="space-y-2">
            {isDatePast && (
              <Button
                onClick={handleStartConferring}
                className="w-full bg-amber-600 hover:bg-amber-700"
                isLoading={isUpdating}
              >
                <AlertCircle className="h-4 w-4" /> Iniciar Conferência
                Pós-Evento
              </Button>
            )}
          </div>
        )}
        {event.status === "confirming" && allConfirmed && (
          <Button
            onClick={handleFinishEvent}
            isLoading={isUpdating}
            className={`w-full ${hasMissing ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"}`}
          >
            <CheckCircle className="h-4 w-4" />
            {hasMissing
              ? "Finalizar com Pendências"
              : "Finalizar Evento — Tudo Conferido"}
          </Button>
        )}
        {showBaixaButton && (
          <Button
            onClick={openBaixaModal}
            className="w-full bg-primary-600 hover:bg-primary-700"
          >
            <TrendingDown className="h-4 w-4" /> Dar Baixa no Estoque
          </Button>
        )}
        {allBaixaProcessed && items.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-sm text-green-700 font-medium">
              Baixa no estoque concluída!
            </p>
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Itens do Evento</h2>
          <span className="text-sm text-gray-500">
            {items.length} produto{items.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="divide-y divide-gray-50">
          {items.map((item) => (
            <div
              key={item.id}
              className={`px-5 py-4 flex items-center justify-between gap-3 ${getItemBg(item)}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {item.product_image_url ? (
                    <img
                      src={item.product_image_url}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Solicitado: {item.quantity_requested} un
                  </p>
                  {item.confirmed && !item.baixa_given && !item.baixa_issue && (
                    <p className="text-xs text-green-600 font-medium">
                      ✅ Confirmado: {item.quantity_confirmed} un
                    </p>
                  )}
                  {item.missing && (
                    <p className="text-xs text-red-600 font-medium">
                      ⚠️ {item.missing_justification}
                    </p>
                  )}
                  {item.baixa_given && (
                    <p className="text-xs text-green-700 font-medium">
                      ✅ Baixa dada: -{item.baixa_quantity} un
                    </p>
                  )}
                  {item.baixa_issue && (
                    <div>
                      <p className="text-xs text-red-600 font-medium">
                        🔴 Problema na baixa: {item.baixa_quantity} un
                      </p>
                      {item.baixa_observation && (
                        <p className="text-xs text-red-500">
                          {item.baixa_observation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {canEdit && (
                  <>
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setEditQty(item.quantity_requested);
                      }}
                      className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteItem.mutate(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
                {event.status === "separating" && !item.separated && (
                  <button
                    onClick={() =>
                      toggleSeparated.mutate({ id: item.id, separated: true })
                    }
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Square className="h-6 w-6" />
                  </button>
                )}
                {event.status === "separating" && item.separated && (
                  <button
                    onClick={() =>
                      toggleSeparated.mutate({ id: item.id, separated: false })
                    }
                    className="text-green-600"
                  >
                    <CheckSquare className="h-6 w-6" />
                  </button>
                )}
                {event.status === "confirming" &&
                  !item.confirmed &&
                  !item.missing && (
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-xs px-2.5"
                        onClick={() => {
                          setConfirmingItem(item);
                          setConfirmQty(item.quantity_requested);
                        }}
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> OK
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        className="text-xs px-2.5"
                        onClick={() => {
                          setMissingItem(item);
                          setJustification("");
                        }}
                      >
                        <AlertCircle className="h-3.5 w-3.5" /> Falta
                      </Button>
                    </div>
                  )}
                {event.status === "has_issues" && item.missing && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-xs"
                    onClick={() => {
                      setResolvingItem(item);
                      setResolveQty(item.quantity_requested);
                    }}
                  >
                    Resolver
                  </Button>
                )}
                {event.status === "separated" &&
                  !item.baixa_given &&
                  !item.baixa_issue && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      ✅ Separado
                    </span>
                  )}
                {item.baixa_given && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    ✅ Baixa OK
                  </span>
                )}
                {item.baixa_issue && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                    🔴 Problema
                  </span>
                )}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="flex flex-col items-center py-10 text-center">
              <Package className="h-8 w-8 text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">Nenhum item adicionado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Dar Baixa */}
      <Modal
        isOpen={isBaixaOpen}
        onClose={() => setIsBaixaOpen(false)}
        title="Dar Baixa no Estoque"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Selecione os itens e informe se a baixa foi OK ou se teve algum
            problema.
          </p>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {items
              .filter((i) => !i.baixa_given && !i.baixa_issue)
              .map((item) => {
                const state = baixaState[item.id];
                if (!state) return null;
                return (
                  <div
                    key={item.id}
                    className={`border rounded-xl p-4 space-y-3 transition-colors ${state.selected ? (state.isIssue ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50") : "border-gray-200 bg-gray-50 opacity-60"}`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={state.selected}
                        onChange={(e) =>
                          setBaixaState((prev) => ({
                            ...prev,
                            [item.id]: {
                              ...prev[item.id],
                              selected: e.target.checked,
                            },
                          }))
                        }
                        className="w-4 h-4 accent-primary-600"
                      />
                      <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {item.product_image_url ? (
                          <img
                            src={item.product_image_url}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.product_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Solicitado: {item.quantity_requested} un
                        </p>
                      </div>
                    </div>

                    {state.selected && (
                      <div className="space-y-3 pl-7">
                        {/* Toggle OK / Problema */}
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setBaixaState((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], isIssue: false },
                              }))
                            }
                            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${!state.isIssue ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                          >
                            ✅ OK
                          </button>
                          <button
                            onClick={() =>
                              setBaixaState((prev) => ({
                                ...prev,
                                [item.id]: { ...prev[item.id], isIssue: true },
                              }))
                            }
                            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${state.isIssue ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                          >
                            🔴 Problema
                          </button>
                        </div>

                        {/* Quantidade */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-600 w-20 shrink-0">
                            Quantidade:
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={state.quantity}
                            onChange={(e) =>
                              setBaixaState((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  quantity: Number(e.target.value),
                                },
                              }))
                            }
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>

                        {/* Observação se problema */}
                        {state.isIssue && (
                          <textarea
                            placeholder="Descreva o problema (danificado, extraviado, etc.)..."
                            value={state.observation}
                            onChange={(e) =>
                              setBaixaState((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...prev[item.id],
                                  observation: e.target.value,
                                },
                              }))
                            }
                            rows={2}
                            className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setIsBaixaOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-primary-600 hover:bg-primary-700"
              onClick={handleBaixa}
              isLoading={isUpdating}
              disabled={!Object.values(baixaState).some((s) => s.selected)}
            >
              <TrendingDown className="h-4 w-4" /> Confirmar Baixa
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Adicionar produtos */}
      <Modal
        isOpen={isAddingProducts}
        onClose={() => {
          setIsAddingProducts(false);
          setCart([]);
        }}
        title="Adicionar Produtos ao Evento"
        size="md"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Buscar produto..."
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="max-h-52 overflow-y-auto space-y-1.5">
            {filteredProducts.map((product) => {
              const inCart = cart.find((i) => i.product_id === product.id);
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Disponível: {product.quantity} un
                      </p>
                    </div>
                  </div>
                  {inCart ? (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-medium">
                      +{inCart.quantity_requested}
                    </span>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addToCart(product)}
                      className="rounded-lg px-2.5 py-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
            {filteredProducts.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                Nenhum produto encontrado
              </p>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t pt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-500">
                {cart.length} produto{cart.length !== 1 ? "s" : ""} selecionado
                {cart.length !== 1 ? "s" : ""}
              </p>
              {cart.map((item) => {
                const product = products.find((p) => p.id === item.product_id);
                return (
                  <div
                    key={item.product_id}
                    className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Disponível: {product?.quantity ?? 0} un
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={product?.quantity ?? 999}
                        value={item.quantity_requested}
                        onChange={(e) =>
                          setCart((p) =>
                            p.map((i) =>
                              i.product_id === item.product_id
                                ? {
                                    ...i,
                                    quantity_requested: Number(e.target.value),
                                  }
                                : i,
                            ),
                          )
                        }
                        className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="text-xs text-gray-400">un</span>
                      <button
                        onClick={() =>
                          setCart((p) =>
                            p.filter((i) => i.product_id !== item.product_id),
                          )
                        }
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddingProducts(false);
                setCart([]);
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddProducts}
              isLoading={addItems.isPending}
              className="flex-1"
              disabled={cart.length === 0}
            >
              Adicionar ao Evento
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Editar quantidade */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Quantidade"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Quantidade de <strong>{editingItem?.product_name}</strong>:
          </p>
          <input
            type="number"
            min={1}
            value={editQty}
            onChange={(e) => setEditQty(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setEditingItem(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditQty}
              isLoading={updateQuantity.isPending}
              className="flex-1"
            >
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Marcar faltando */}
      <Modal
        isOpen={!!missingItem}
        onClose={() => setMissingItem(null)}
        title="Item Faltando"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Justifique o motivo do item{" "}
            <strong>{missingItem?.product_name}</strong> estar faltando:
          </p>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Ex: Item não encontrado, quebrado..."
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setMissingItem(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={handleMarkMissing}
              isLoading={markMissing.isPending}
            >
              Confirmar Falta
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Confirmar item */}
      <Modal
        isOpen={!!confirmingItem}
        onClose={() => setConfirmingItem(null)}
        title="Confirmar Quantidade"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Quantidade confirmada de{" "}
            <strong>{confirmingItem?.product_name}</strong>:
          </p>
          <p className="text-xs text-gray-400">
            Solicitado: {confirmingItem?.quantity_requested} un — pode ser
            parcial
          </p>
          <input
            type="number"
            min={0}
            value={confirmQty}
            onChange={(e) => setConfirmQty(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setConfirmingItem(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleConfirmItem}
              isLoading={confirmItem.isPending}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Resolver pendência */}
      <Modal
        isOpen={!!resolvingItem}
        onClose={() => setResolvingItem(null)}
        title="Resolver Pendência"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Quantidade encontrada de{" "}
            <strong>{resolvingItem?.product_name}</strong>:
          </p>
          <input
            type="number"
            min={0}
            value={resolveQty}
            onChange={(e) => setResolveQty(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setResolvingItem(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleResolveItem}
              isLoading={resolveMissing.isPending}
            >
              Resolver
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Editar Evento */}
      <Modal
        isOpen={isEditEventOpen}
        onClose={() => setIsEditEventOpen(false)}
        title="Editar Evento"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Nome do Evento *
            </label>
            <input
              type="text"
              value={editEventName}
              onChange={(e) => setEditEventName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Data do Evento *
            </label>
            <input
              type="date"
              value={editEventDate}
              onChange={(e) => setEditEventDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Observações
            </label>
            <textarea
              value={editEventNotes}
              onChange={(e) => setEditEventNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsEditEventOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEditEvent}
              isLoading={isSavingEvent}
              className="flex-1"
            >
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
