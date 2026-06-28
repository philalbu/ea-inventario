import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { ArrowLeft, Package, Plus, Minus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth.store";
import { Spinner } from "@/components/common/Spinner";
import type { Product } from "@/types";

type Step = "scanning" | "found" | "quantity";
type MovementType = "in" | "out";

export function ScanPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  const [step, setStep] = useState<Step>("scanning");
  const [product, setProduct] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<MovementType>("in");
  const [qty, setQty] = useState(1);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const stopCamera = useCallback(() => {
    readerRef.current?.reset();
  }, []);

  const findByBarcode = useCallback(
    async (barcode: string) => {
      if (searching) return;
      setSearching(true);
      stopCamera();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("barcode", barcode)
        .single();
      setSearching(false);
      if (error || !data) {
        setError("Produto não encontrado para este código de barras.");
        setStep("scanning");
        startCamera();
        return;
      }
      setProduct(data as Product);
      setStep("found");
    },
    [searching],
  );

  const startCamera = useCallback(() => {
    if (!videoRef.current) return;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    setError(null);
    reader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
      if (result) {
        findByBarcode(result.getText());
      }
      if (err && !(err instanceof NotFoundException)) {
        console.error(err);
      }
    });
  }, [findByBarcode]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const handleConfirm = async () => {
    if (!product || !user) return;
    setSaving(true);

    const newQty =
      movementType === "in"
        ? product.quantity + qty
        : Math.max(0, product.quantity - qty);

    const { error: updateError } = await supabase
      .from("products")
      .update({ quantity: newQty })
      .eq("id", product.id);

    if (updateError) {
      setSaving(false);
      setError("Erro ao atualizar estoque.");
      return;
    }

    await supabase.from("stock_movements").insert({
      product_id: product.id,
      product_name: product.name,
      type: movementType,
      quantity: qty,
      quantity_before: product.quantity,
      quantity_after: newQty,
      user_id: user.id,
      user_email: user.email,
    });

    setSaving(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setProduct(null);
      setQty(1);
      setStep("scanning");
      startCamera();
    }, 1800);
  };

  const handleChooseType = (type: MovementType) => {
    setMovementType(type);
    setQty(1);
    setStep("quantity");
  };

  const handleBack = () => {
    if (step === "quantity") {
      setStep("found");
    } else if (step === "found") {
      setProduct(null);
      setStep("scanning");
      startCamera();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={handleBack} className="text-white/70 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-white font-semibold text-base">
          {step === "scanning" && "Escanear produto"}
          {step === "found" && "Produto encontrado"}
          {step === "quantity" &&
            (movementType === "in" ? "Entrada de estoque" : "Saída de estoque")}
        </h1>
      </div>

      {/* Scanner */}
      <div className={step === "scanning" ? "block" : "hidden"}>
        <div className="relative mx-4 rounded-2xl overflow-hidden bg-black aspect-square">
          <video ref={videoRef} className="w-full h-full object-cover" />
          {/* Viewfinder */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-36 border-2 border-white/60 rounded-xl" />
          </div>
          {searching && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
        </div>
        <p className="text-center text-white/50 text-sm mt-4">
          Aponte a câmera para o código de barras
        </p>
        {error && (
          <p className="text-center text-red-400 text-sm mt-2 px-6">{error}</p>
        )}
      </div>

      {/* Produto encontrado */}
      {step === "found" && product && (
        <div className="flex flex-col flex-1 px-4 gap-4">
          <div className="bg-white/10 rounded-2xl overflow-hidden">
            <div className="h-40 bg-gray-800 flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-16 w-16 text-white/20" />
              )}
            </div>
            <div className="p-4">
              <h2 className="text-white font-semibold text-lg">
                {product.name}
              </h2>
              <p className="text-white/50 text-sm mt-1">
                Estoque atual:{" "}
                <span
                  className={`font-bold ${product.quantity === 0 ? "text-red-400" : product.quantity <= 5 ? "text-amber-400" : "text-green-400"}`}
                >
                  {product.quantity} un
                </span>
              </p>
            </div>
          </div>

          <p className="text-white/60 text-sm text-center">
            O que deseja fazer?
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleChooseType("in")}
              className="flex flex-col items-center gap-2 bg-green-600/20 border border-green-500/30 rounded-2xl p-5 hover:bg-green-600/30 transition-colors"
            >
              <Plus className="h-8 w-8 text-green-400" />
              <span className="text-green-400 font-semibold">Entrada</span>
            </button>
            <button
              onClick={() => handleChooseType("out")}
              className="flex flex-col items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-2xl p-5 hover:bg-red-600/30 transition-colors"
            >
              <Minus className="h-8 w-8 text-red-400" />
              <span className="text-red-400 font-semibold">Saída</span>
            </button>
          </div>
        </div>
      )}

      {/* Quantidade */}
      {step === "quantity" && product && (
        <div className="flex flex-col flex-1 px-4 gap-6">
          <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-700 overflow-hidden flex items-center justify-center shrink-0">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-6 w-6 text-white/30" />
              )}
            </div>
            <div>
              <p className="text-white font-medium text-sm">{product.name}</p>
              <p className="text-white/50 text-xs">
                Estoque atual: {product.quantity} un
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <p className="text-white/60 text-sm">Quantidade</p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-5xl font-bold text-white w-16 text-center">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <p className="text-white/40 text-xs">
              Estoque após:{" "}
              <span className="text-white/70 font-medium">
                {movementType === "in"
                  ? product.quantity + qty
                  : Math.max(0, product.quantity - qty)}{" "}
                un
              </span>
            </p>
          </div>

          {error && <p className="text-center text-red-400 text-sm">{error}</p>}

          {success ? (
            <div className="bg-green-600/20 border border-green-500/30 rounded-2xl p-4 text-center">
              <p className="text-green-400 font-semibold">
                {movementType === "in" ? "Entrada" : "Saída"} registrada com
                sucesso!
              </p>
            </div>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={saving}
              className={`w-full py-4 rounded-2xl font-semibold text-white transition-colors ${
                movementType === "in"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } disabled:opacity-50`}
            >
              {saving ? (
                <Spinner size="sm" />
              ) : movementType === "in" ? (
                "Confirmar Entrada"
              ) : (
                "Confirmar Saída"
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
