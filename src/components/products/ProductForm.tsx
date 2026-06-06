import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { Input, Select, Textarea } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { getPreviewUrl } from "@/utils/image";
import type { Product, Category, Location, ProductFormData } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  quantity: z.coerce.number().int().min(0, "Quantidade deve ser >= 0"),
  category_id: z.string().min(1, "Selecione uma categoria"),
  location_id: z.string().optional(),
  status: z.enum(["active", "inactive", "low_stock"]),
  description: z.string().optional(),
  image: z.any().optional(),
});

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  categories: Category[];
  locations: Location[];
  initialData?: Product;
  isSubmitting?: boolean;
}

export function ProductForm({
  onSubmit,
  onCancel,
  categories,
  locations,
  initialData,
  isSubmitting,
}: ProductFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image_url ?? null,
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          quantity: initialData.quantity,
          category_id: initialData.category_id ?? "",
          location_id: initialData.location_id ?? "",
          status: initialData.status,
          description: initialData.description ?? "",
        }
      : { status: "active", quantity: 0, location_id: "" },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setValue("image", e.target.files as FileList);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue("image", undefined);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Foto do Produto
        </label>
        {imagePreview ? (
          <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={getPreviewUrl(imagePreview) ?? imagePreview ?? ""}
              alt="Preview"
              className="w-full h-full object-cover"
            />{" "}
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-700" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                Clique para enviar foto
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                PNG, JPG, WEBP até 5MB
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary-600 font-medium">
              <Upload className="h-3.5 w-3.5" /> Selecionar arquivo
            </div>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      <Input
        label="Nome do Produto *"
        placeholder="Ex: Shampoo Premium 500ml"
        error={errors.name?.message}
        {...register("name")}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Quantidade *"
          type="number"
          min={0}
          placeholder="0"
          error={errors.quantity?.message}
          {...register("quantity")}
        />
        <Select
          label="Status *"
          error={errors.status?.message}
          {...register("status")}
        >
          <option value="active">Ativo</option>
          <option value="low_stock">Estoque Baixo</option>
          <option value="inactive">Inativo</option>
        </Select>
      </div>

      <Select
        label="Categoria *"
        error={errors.category_id?.message}
        {...register("category_id")}
      >
        <option value="">Selecione uma categoria</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </Select>

      <Select label="Local / Localização" {...register("location_id")}>
        <option value="">Sem local definido</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </Select>

      <Textarea
        label="Descrição (opcional)"
        placeholder="Informações adicionais sobre o produto..."
        rows={3}
        {...register("description")}
      />

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
          {initialData ? "Salvar Alterações" : "Adicionar Produto"}
        </Button>
      </div>
    </form>
  );
}
