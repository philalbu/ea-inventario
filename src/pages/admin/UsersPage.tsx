import { useState } from "react";
import { Plus, Trash2, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { useUsers } from "@/hooks/useAdmin";
import type { RoleName, UserWithRole } from "@/types";

const roleConfig = {
  super_admin: { label: "Super Admin", color: "bg-red-100 text-red-700" },
  admin: { label: "Admin", color: "bg-purple-100 text-purple-700" },
  operator: { label: "Operador", color: "bg-blue-100 text-blue-700" },
};

export function UsersPage() {
  const { users, isLoading, createUser, deleteUser } = useUsers();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserWithRole | null>(null);
  const [formError, setFormError] = useState("");

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleName, setRoleName] = useState<RoleName>("operator");

  // Gera username automaticamente ao digitar nome
  const handleFullNameChange = (value: string) => {
    setFullName(value);
    const generated = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .split(" ")
      .filter((w) => w.length > 0)
      .slice(0, 2)
      .join(".");
    setUsername(generated);
  };

  const resetForm = () => {
    setFullName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setRoleName("operator");
    setFormError("");
  };

  const handleCreate = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setFormError("Preencha todos os campos obrigatórios");
      return;
    }
    try {
      setFormError("");
      await createUser.mutateAsync({
        full_name: fullName,
        username,
        email,
        password,
        role_name: roleName,
      });
      resetForm();
      setIsCreateOpen(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Erro ao criar usuário",
      );
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {users.length} usuário{users.length !== 1 ? "s" : ""} cadastrado
            {users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => {
            const role = user.role?.name as RoleName | undefined;
            const config = role ? roleConfig[role] : null;
            return (
              <div
                key={user.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {user.full_name ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                    {user.username && (
                      <p className="text-xs text-gray-400">@{user.username}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {config && (
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.color}`}
                    >
                      {config.label}
                    </span>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeletingUser(user)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          {users.length === 0 && (
            <div className="flex flex-col items-center py-20 text-center">
              <User className="h-10 w-10 text-gray-200 mb-3" />
              <p className="text-gray-500 font-medium">
                Nenhum usuário cadastrado
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal: Criar usuário */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Novo Usuário"
        size="md"
      >
        <div className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" /> {formError}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Nome Completo *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => handleFullNameChange(e.target.value)}
              placeholder="Ex: João Silva"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Login (gerado automaticamente)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-400">Pode editar se quiser</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              E-mail *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Senha inicial *
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Cargo *</label>
            <select
              value={roleName}
              onChange={(e) => setRoleName(e.target.value as RoleName)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="operator">Operador</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setIsCreateOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              isLoading={createUser.isPending}
              className="flex-1"
            >
              Criar Usuário
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Deletar */}
      <Modal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        title="Remover Usuário"
        size="sm"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              Remover "{deletingUser?.full_name}"?
            </p>
            <p className="text-sm text-gray-500 mt-1">
              O usuário perderá acesso imediatamente.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => setDeletingUser(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              isLoading={deleteUser.isPending}
              onClick={async () => {
                await deleteUser.mutateAsync(deletingUser!.id);
                setDeletingUser(null);
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
