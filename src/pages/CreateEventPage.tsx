import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Package,
  Trash2,
  Calendar,
  User,
  FileText,
  ShoppingCart,
  Search,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { useResponsibles } from "@/hooks/useResponsibles";
import { useEvents } from "@/hooks/useEvents";
import { useAuthStore } from "@/store/auth.store";
import { productsService } from "@/services/products.service";
import { getThumbnailUrl } from "@/utils/image";
import type { CartItem, EventFormData } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  event_date: z.string().min(1, "Data é obrigatória"),
  responsible_id: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CartItemWithShake extends CartItem {
  shaking?: boolean;
}

const STEPS = [
  { number: 1, label: "Detalhes" },
  { number: 2, label: "Produtos" },
  { number: 3, label: "Confirmação" },
];

export function CreateEventPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { responsibles } = useResponsibles();
  const { createEvent } = useEvents();

  // Busca TODOS os produtos sem paginação
  const { data: allProducts = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products-all-select"],
    queryFn: () => productsService.getAllForSelect(),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<CartItemWithShake[]>([]);
  const [search, setSearch] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Busca inteligente: nome, categoria e localização — em TODOS os produtos
  const filtered = allProducts.filter((p) => {
    if (cart.find((c) => c.product_id === p.id)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.category_name ?? "").toLowerCase().includes(q) ||
      (p.location_name ?? "").toLowerCase().includes(q)
    );
  });

  const addToCart = (product: (typeof allProducts)[0]) => {
    setCart((prev) => [
      ...prev,
      {
        product_id: product.id,
        product_name: product.name,
        product_image_url: product.image_url,
        quantity_requested: 1,
      },
    ]);
  };

  const updateQty = (product_id: string, value: string) => {
    const qty = parseInt(value) || 0;
    const product = allProducts.find((p) => p.id === product_id);
    const overStock = product && qty > product.quantity;

    if (overStock) {
      setCart((prev) =>
        prev.map((i) =>
          i.product_id === product_id
            ? { ...i, quantity_requested: qty, shaking: true }
            : i,
        ),
      );
      setTimeout(() => {
        setCart((prev) =>
          prev.map((i) =>
            i.product_id === product_id ? { ...i, shaking: false } : i,
          ),
        );
      }, 400);
    } else {
      setCart((prev) =>
        prev.map((i) =>
          i.product_id === product_id ? { ...i, quantity_requested: qty } : i,
        ),
      );
    }
  };

  const removeFromCart = (product_id: string) => {
    setCart((prev) => prev.filter((i) => i.product_id !== product_id));
  };

  const handleNext = handleSubmit(() => setStep(2));

  const handleConfirm = async () => {
    const formData = getValues();
    const resp = responsibles.find((r) => r.id === formData.responsible_id);
    await createEvent.mutateAsync({
      formData: { ...formData, responsible_name: resp?.name },
      items: cart,
    });
    navigate("/events");
  };

  const getStockForItem = (product_id: string) => {
    return allProducts.find((p) => p.id === product_id)?.quantity ?? 0;
  };

  const isOverStock = (item: CartItemWithShake) => {
    return item.quantity_requested > getStockForItem(item.product_id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() =>
              step === 1 ? navigate("/events") : setStep(step - 1)
            }
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Novo Evento</h1>
            <p className="text-sm text-gray-500">
              Passo {step} de 3 — {STEPS[step - 1].label}
            </p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center">
            {STEPS.map((s, idx) => (
              <div
                key={s.number}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      step > s.number
                        ? "bg-green-500 text-white"
                        : step === s.number
                          ? "bg-primary-600 text-white"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step > s.number ? <Check className="h-4 w-4" /> : s.number}
                  </div>
                  <span
                    className={`text-sm font-medium hidden sm:block ${step === s.number ? "text-primary-600" : "text-gray-400"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 ${step > s.number ? "bg-green-400" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary-600" />
                </div>
                <h2 className="font-semibold text-gray-900">
                  Detalhes do Evento
                </h2>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Nome do Evento *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Casamento João e Maria"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.name ? "border-red-400" : "border-gray-300"}`}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Data do Evento *
                </label>
                <input
                  type="date"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.event_date ? "border-red-400" : "border-gray-300"}`}
                  {...register("event_date")}
                />
                {errors.event_date && (
                  <p className="text-xs text-red-600">
                    {errors.event_date.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Responsável
                  </span>
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register("responsible_id")}
                >
                  <option value="">Sem responsável</option>
                  {responsibles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" /> Observações
                  </span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Informações adicionais..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  {...register("notes")}
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full">
              Próximo — Adicionar Produtos <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Package className="h-4 w-4 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">
                    Adicionar Produtos
                  </h2>
                  {!isLoadingProducts && (
                    <p className="text-xs text-gray-400">
                      {allProducts.length} produtos disponíveis
                    </p>
                  )}
                </div>
              </div>

              {/* Campo de busca inteligente */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, categoria ou local..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {isLoadingProducts ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 rounded-full border-4 border-primary-600 border-t-transparent" />
                </div>
              ) : (
                <>
                  {search && (
                    <p className="text-xs text-gray-400 mb-2">
                      {filtered.length} resultado
                      {filtered.length !== 1 ? "s" : ""} para "{search}"
                    </p>
                  )}
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {filtered.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            {product.image_url ? (
                              <img
                                src={getThumbnailUrl(product.image_url) ?? ""}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
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
                            <div className="flex items-center gap-2 mt-0.5">
                              <p
                                className={`text-xs ${product.quantity === 0 ? "text-red-500" : "text-gray-400"}`}
                              >
                                {product.quantity === 0
                                  ? "⚠️ Sem estoque"
                                  : `${product.quantity} em estoque`}
                              </p>
                              {product.category_name && (
                                <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
                                  {product.category_name}
                                </span>
                              )}
                              {product.location_name && (
                                <span className="text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full">
                                  {product.location_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product)}
                          className="rounded-lg px-2.5 py-1.5 shrink-0"
                        >
                          + Adicionar
                        </Button>
                      </div>
                    ))}
                    {filtered.length === 0 && search && (
                      <div className="text-center py-8">
                        <Search className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          Nenhum produto encontrado para "{search}"
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Tente buscar por nome, categoria ou local
                        </p>
                      </div>
                    )}
                    {filtered.length === 0 && !search && (
                      <p className="text-sm text-gray-400 text-center py-6">
                        Todos os produtos já foram adicionados
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Carrinho */}
            {cart.length > 0 && (
              <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
                <div className="bg-primary-50 px-5 py-3 flex items-center gap-2 border-b border-primary-100">
                  <ShoppingCart className="h-4 w-4 text-primary-600" />
                  <p className="text-sm font-semibold text-primary-700">
                    {cart.length} produto{cart.length !== 1 ? "s" : ""}{" "}
                    selecionado{cart.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="divide-y divide-gray-50">
                  {cart.map((item) => {
                    const stock = getStockForItem(item.product_id);
                    const over = isOverStock(item);
                    return (
                      <div
                        key={item.product_id}
                        className="flex items-center justify-between px-5 py-3 gap-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            {item.product_image_url ? (
                              <img
                                src={
                                  getThumbnailUrl(item.product_image_url) ?? ""
                                }
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {item.product_name}
                            </p>
                            <p
                              className={`text-xs ${over ? "text-red-500 font-medium" : "text-gray-400"}`}
                            >
                              {over
                                ? `⚠️ Só ${stock} em estoque`
                                : `${stock} em estoque`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQty(
                                item.product_id,
                                String(
                                  Math.max(1, item.quantity_requested - 1),
                                ),
                              )
                            }
                            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 text-sm font-bold"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity_requested}
                            onChange={(e) =>
                              updateQty(item.product_id, e.target.value)
                            }
                            className={`w-14 text-center rounded-lg border px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${item.shaking ? "shake" : ""} ${over ? "border-red-400 bg-red-50 text-red-600 focus:ring-red-400" : "border-gray-300"}`}
                          />
                          <button
                            onClick={() =>
                              updateQty(
                                item.product_id,
                                String(item.quantity_requested + 1),
                              )
                            }
                            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 text-sm font-bold"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-gray-400 hover:text-red-500 ml-1 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
              <Button
                size="lg"
                onClick={() => setStep(3)}
                className="flex-1"
                disabled={cart.length === 0}
              >
                Revisar <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <h2 className="font-semibold text-gray-900">
                  Confirmar Evento
                </h2>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Nome</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getValues("name")}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-500">Data</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(
                      getValues("event_date") + "T00:00:00",
                    ).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {getValues("responsible_id") && (
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500">Responsável</span>
                    <span className="text-sm font-medium text-gray-900">
                      {
                        responsibles.find(
                          (r) => r.id === getValues("responsible_id"),
                        )?.name
                      }
                    </span>
                  </div>
                )}
                {getValues("notes") && (
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">Obs.</span>
                    <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">
                      {getValues("notes")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Produtos do Evento
                </h3>
                <span className="text-xs text-gray-400">
                  {cart.length} produto{cart.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {cart.map((item) => {
                  const over = isOverStock(item);
                  return (
                    <div
                      key={item.product_id}
                      className={`flex items-center justify-between px-5 py-3 ${over ? "bg-red-50" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          {item.product_image_url ? (
                            <img
                              src={
                                getThumbnailUrl(item.product_image_url) ?? ""
                              }
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {item.product_name}
                          </p>
                          {over && (
                            <p className="text-xs text-red-500 font-medium">
                              ⚠️ Quantidade acima do estoque
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${over ? "text-red-600" : "text-gray-900"}`}
                        >
                          {item.quantity_requested} un
                        </p>
                        <p className="text-xs text-gray-400">
                          {getStockForItem(item.product_id)} em estoque
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {cart.some(isOverStock) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                ⚠️ Alguns produtos têm quantidade acima do estoque. Você pode
                continuar mesmo assim.
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
              <Button
                size="lg"
                onClick={handleConfirm}
                isLoading={createEvent.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" /> Criar Evento
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
