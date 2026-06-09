import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  User,
  Phone,
  Mail,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { useResponsibles } from "@/hooks/useResponsibles";
import { usePermissionStore } from "@/store/permission.store";
import type { Responsible } from "@/types";

export function ResponsiblesPage() {
  const {
    responsibles,
    isLoading,
    createResponsible,
    updateResponsible,
    deleteResponsible,
  } = useResponsibles();

  const hasPermission = usePermissionStore((s) => s.hasPermission);
  const canCreate = hasPermission("responsibles", "create");
  const canUpdate = hasPermission("responsibles", "update");
  const canDelete = hasPermission("responsibles", "delete");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Responsible | null>(null);
  const [deletingItem, setDeletingItem] = useState<Responsible | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setFormError("");
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setFormError("Nome é obrigatório");
      return;
    }
    await createResponsible.mutateAsync({ name: name.trim(), phone, email });
    resetForm();
    setIsCreateOpen(false);
  };

  const handleEdit = async () => {
    if (!editingItem || !name.trim()) {
      setFormError("Nome é obrigatório");
      return;
    }
    await updateResponsible.mutateAsync({
      id: editingItem.id,
      name: name.trim(),
      phone,
      email,
    });
    resetForm();
    setEditingItem(null);
  };

  const openEdit = (r: Responsible) => {
    setName(r.name);
    setPhone(r.phone ?? "");
    setEmail(r.email ?? "");
    setFormError("");
    setEditingItem(r);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Responsáveis</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {responsibles.length} responsável
            {responsibles.length !== 1 ? "is" : ""} cadastrado
            {responsibles.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canCreate && (
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Responsável</span>
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : responsibles.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">
            Nenhum responsável cadastrado
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Adicione responsáveis para atribuir aos eventos
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {responsibles.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{r.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {r.phone && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="h-3 w-3" />
                        {r.phone}
                      </span>
                    )}
                    {r.email && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail className="h-3 w-3" />
                        {r.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {(canUpdate || canDelete) && (
                <div className="flex gap-2 shrink-0">
                  {canUpdate && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEdit(r)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeletingItem(r)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Criar */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Novo Responsável"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Nome *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormError("");
              }}
              placeholder="Nome completo"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {formError && <p className="text-xs text-red-600">{formError}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Telefone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsCreateOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              isLoading={createResponsible.isPending}
              className="flex-1"
            >
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Editar */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title="Editar Responsável"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Nome *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormError("");
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {formError && <p className="text-xs text-red-600">{formError}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Telefone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setEditingItem(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEdit}
              isLoading={updateResponsible.isPending}
              className="flex-1"
            >
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Deletar */}
      <Modal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        title="Remover Responsável"
        size="sm"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              Remover "{deletingItem?.name}"?
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Eventos vinculados perderão o responsável.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => setDeletingItem(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              isLoading={deleteResponsible.isPending}
              onClick={async () => {
                await deleteResponsible.mutateAsync(deletingItem!.id);
                setDeletingItem(null);
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
