import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { Sidebar } from './Sidebar'
import { FullPageSpinner } from '@/components/common/Spinner'

export function ProtectedLayout() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto md:pt-0 pt-14">
        <Outlet />
      </main>
    </div>
  )
}
