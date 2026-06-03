import { supabase } from '@/lib/supabase'

const CREDENTIALS = {
  username: 'ederson.albuquerque',
  email: 'ederson.albuquerque@inventariopro.app',
  password: '1234',
}

export const authService = {
  async signIn(username: string, password: string) {
    if (username !== CREDENTIALS.username) {
      throw new Error('Usuário ou senha inválidos')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: CREDENTIALS.email,
      password,
    })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Usuário ou senha inválidos')
      }
      throw new Error(error.message)
    }

    return data
  },

  async signUp() {
    const { data, error } = await supabase.auth.signUp({
      email: CREDENTIALS.email,
      password: CREDENTIALS.password,
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },
}
