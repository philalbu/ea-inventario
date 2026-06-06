import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Minus, ShoppingCart, Package, Trash2 } from "lucide-react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import type { Product, CartItem, EventFormData, Responsible } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  event_date: z.string().min(1, "Data é obrigatória"),
  responsible_id: z.string().optional(),
  notes: z.string().optional(),
});

interface EventFormProps {
  products: Product[];
  responsibles: Responsible[];
  onSubmit: (data: EventFormData, items: CartItem[]) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function EventForm({
  products,
  responsibles,
  onSubmit,
  onCancel,
  isSubmitting,
}: EventFormProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(schema),
  });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.product_id === product.id);
      if (exists)
        return prev.map((i) =>
          i.product_id === product.id
            ? { ...i, quantity_requested: i.quantity_requested + 1 }
            : i,
        );
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

  const updateQty = (product_id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(product_id);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.product_id === product_id ? { ...i, quantity_requested: qty } : i,
      ),
    );
  };

  const removeFromCart = (product_id: string) => {
    setCart((prev) => prev.filter((i) => i.product_id !== product_id));
  };

  const handleFormSubmit = async (data: EventFormData) => {
    if (cart.length === 0)
      return alert("Adicione pelo menos um produto ao evento.");
    await onSubmit(data, cart);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nome do Evento *"
          placeholder="Ex: Casamento João e Maria"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Data do Evento *"
          type="date"
          error={errors.event_date?.message}
          {...register("event_date")}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Responsável</label>
        <select
          {...register("responsible_id")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="">Sem responsável</option>
          {responsibles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Observações"
        placeholder="Informações adicionais..."
        {...register("notes")}
      />

      {/* Produtos */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-700">
            Adicionar Produtos ao Evento
          </p>
        </div>
        <div className="p-3">
          <input
            type="text"
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="max-h-48 overflow-y-auto space-y-1.5">
            {filtered.map((product) => {
              const inCart = cart.find((i) => i.product_id === product.id);
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 border border-gray-100"
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
                        {product.quantity} em estoque
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
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                Nenhum produto encontrado
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Carrinho */}
      {cart.length > 0 && (
        <div className="border border-primary-200 rounded-xl overflow-hidden">
          <div className="bg-primary-50 px-4 py-3 border-b border-primary-200 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary-600" />
            <p className="text-sm font-semibold text-primary-700">
              {cart.length} produto{cart.length !== 1 ? "s" : ""} no evento
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {cart.map((item) => (
              <div
                key={item.product_id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
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
                  <p className="text-sm font-medium text-gray-800">
                    {item.product_name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateQty(item.product_id, item.quantity_requested - 1)
                    }
                    className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">
                    {item.quantity_requested}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQty(item.product_id, item.quantity_requested + 1)
                    }
                    className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product_id)}
                    className="ml-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting} className="flex-1">
          Criar Evento
        </Button>
      </div>
    </form>
  );
}
