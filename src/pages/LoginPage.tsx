import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Package, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth.store'
import { FullPageSpinner } from '@/components/common/Spinner'

const schema = z.object({
  username: z.string().min(1, 'Usuário é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type LoginFormData = z.infer<typeof schema>

export function LoginPage() {
  const { signIn } = useAuth()
  const { user, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(schema) })

  if (isLoading) return <FullPageSpinner />
  if (user) return <Navigate to="/products" replace />

  const onSubmit = async ({ username, password }: LoginFormData) => {
    try {
      setError(null)
      await signIn(username, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-white/3 rounded-full" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 pt-8 pb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl leading-none">Inventário Pro</h1>
                <p className="text-primary-200 text-sm mt-0.5">Gestão de estoque</p>
              </div>
            </div>
            <h2 className="text-white font-semibold text-2xl">Bem-vindo de volta!</h2>
            <p className="text-primary-200 text-sm mt-1">Faça login para acessar seu inventário</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <Input
                label="Usuário"
                placeholder="Seu nome de usuário"
                autoComplete="username"
                error={errors.username?.message}
                {...register('username')}
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    className={`w-full rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.password ? 'border-red-400' : 'border-gray-300'
                    }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" isLoading={isSubmitting} size="lg" className="w-full mt-2">
                Entrar no sistema
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-primary-200 text-xs mt-6">
          Inventário Pro © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
