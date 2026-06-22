import { useState } from "react";
import { ClipboardList, Search } from "lucide-react";
import { useAudit } from "@/hooks/useAdmin";
import type { AuditAction } from "@/types";

const actionConfig: Record<
  AuditAction,
  { label: string; color: string; dot: string }
> = {
  CREATE: {
    label: "Criou",
    color: "bg-green-50 text-green-700",
    dot: "bg-green-500",
  },
  UPDATE: {
    label: "Editou",
    color: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  DELETE: {
    label: "Deletou",
    color: "bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  LOGIN: {
    label: "Login",
    color: "bg-gray-50 text-gray-600",
    dot: "bg-gray-400",
  },
  LOGOUT: {
    label: "Logout",
    color: "bg-gray-50 text-gray-600",
    dot: "bg-gray-400",
  },
  VIEW: {
    label: "Visualizou",
    color: "bg-purple-50 text-purple-700",
    dot: "bg-purple-400",
  },
};

const moduleLabels: Record<string, string> = {
  products: "Produtos",
  categories: "Categorias",
  locations: "Locais",
  events: "Eventos",
  responsibles: "Responsáveis",
  admin: "Administrador",
  users: "Usuários",
  auth: "Autenticação",
};

export function AuditPage() {
  const { logs, isLoading, refetch } = useAudit();
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterModule, setFilterModule] = useState("");

  const filtered = logs.filter((log) => {
    const matchSearch =
      !search ||
      log.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      log.record_label?.toLowerCase().includes(search.toLowerCase());
    const matchAction = !filterAction || log.action === filterAction;
    const matchModule = !filterModule || log.module === filterModule;
    return matchSearch && matchAction && matchModule;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRelativeTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 1) return "agora";
    if (mins < 60) return `há ${mins} min`;
    if (hours < 24) return `há ${hours}h`;
    return `há ${days} dia${days !== 1 ? "s" : ""}`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auditoria</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Histórico completo de ações no sistema
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Atualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por usuário ou item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="text-sm rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todas as ações</option>
          <option value="CREATE">Criou</option>
          <option value="UPDATE">Editou</option>
          <option value="DELETE">Deletou</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
        </select>
        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="text-sm rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos os módulos</option>
          {Object.entries(moduleLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Logs */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <ClipboardList className="h-10 w-10 text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">Nenhum log encontrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map((log) => {
              const action = actionConfig[log.action];
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-2 shrink-0 ${action.dot}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${action.color}`}
                      >
                        {action.label}
                      </span>
                      <span className="text-xs text-gray-400">
                        {moduleLabels[log.module] ?? log.module}
                      </span>
                      {log.record_label && (
                        <span className="text-xs font-medium text-gray-700">
                          "{log.record_label}"
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      <span className="font-medium text-gray-800">
                        {log.user_email}
                      </span>
                    </p>
                    {log.old_data && log.new_data && (
                      <details className="mt-1">
                        <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                          Ver alterações
                        </summary>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-red-50 rounded-lg p-2">
                            <p className="font-medium text-red-600 mb-1">
                              Antes
                            </p>
                            <pre className="text-red-700 overflow-auto">
                              {JSON.stringify(log.old_data, null, 2)}
                            </pre>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2">
                            <p className="font-medium text-green-600 mb-1">
                              Depois
                            </p>
                            <pre className="text-green-700 overflow-auto">
                              {JSON.stringify(log.new_data, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </details>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">
                      {getRelativeTime(log.created_at)}
                    </p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {formatDate(log.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
