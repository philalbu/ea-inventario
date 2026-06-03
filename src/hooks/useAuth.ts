import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import { categoriesService } from '@/services/products.service'

export function useAuth() {
  const { user, isLoading, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading])

  const signIn = async (username: string, password: string) => {
    const data = await authService.signIn(username, password)
    if (data.user) {
      await categoriesService.seedDefaults(data.user.id)
    }
    return data
  }

  const signOut = async () => {
    await authService.signOut()
  }

  return { user, isLoading, signIn, signOut }
}
