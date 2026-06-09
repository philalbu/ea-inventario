import { Link } from "react-router-dom";
import { Shield, ClipboardList, Users } from "lucide-react";

export function AdminPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Administrador</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Gerencie usuários, cargos e auditoria do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Usuários */}
        <Link
          to="/admin/users"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow group"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
            <Users className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="font-semibold text-gray-900 mb-1">Usuários</h2>
          <p className="text-sm text-gray-500">
            Criar e gerenciar usuários do sistema
          </p>
        </Link>

        {/* Cargos e Permissões */}
        <Link
          to="/admin/roles"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <h2 className="font-semibold text-gray-900 mb-1">
            Cargos e Permissões
          </h2>
          <p className="text-sm text-gray-500">
            Definir o que cada cargo pode acessar
          </p>
        </Link>

        {/* Auditoria */}
        <Link
          to="/admin/audit"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
            <ClipboardList className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="font-semibold text-gray-900 mb-1">Auditoria</h2>
          <p className="text-sm text-gray-500">
            Histórico de todas as ações do sistema
          </p>
        </Link>
      </div>
    </div>
  );
}
