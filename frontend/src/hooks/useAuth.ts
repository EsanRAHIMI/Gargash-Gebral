// /frontend/src/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import { useState } from 'react'

// Define interfaces for the user data and auth state
interface User {
  id: string
  name: string
  email: string
}

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
}

const authUrl = import.meta.env.VITE_AUTH_URL

// Configure axios to include credentials
axios.defaults.withCredentials = true

export const useAuth = () => {
  const queryClient = useQueryClient()
  // Initialize from localStorage to maintain state across navigation
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem('isAuthenticated') === 'true'
  )

  // Fetch the current user
  const { data: user, isLoading, error } = useQuery<User>(
    'user',
    async () => {
      const { data } = await axios.get(`${authUrl}/verify`)
      return data
    },
    {
      retry: 1,
      onSuccess: () => {
        setIsAuthenticated(true)
        localStorage.setItem('isAuthenticated', 'true')
      },
      onError: () => {
        setIsAuthenticated(false)
        localStorage.removeItem('isAuthenticated')
      },
    }
  )

  // Login mutation
  const loginMutation = useMutation(
    (credentials: LoginData) => axios.post(`${authUrl}/login`, credentials),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user')
        setIsAuthenticated(true)
        localStorage.setItem('isAuthenticated', 'true')
      },
    }
  )

  // Register mutation
  const registerMutation = useMutation(
    (userData: RegisterData) => axios.post(`${authUrl}/register`, userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user')
        setIsAuthenticated(true)
        localStorage.setItem('isAuthenticated', 'true')
      },
    }
  )

  // Logout mutation
  const logoutMutation = useMutation(
    () => axios.post(`${authUrl}/logout`),
    {
      onSuccess: () => {
        queryClient.setQueryData('user', null)
        setIsAuthenticated(false)
        localStorage.removeItem('isAuthenticated')
      },
    }
  )

  // Rest of the code remains the same...
  const login = (credentials: LoginData) => loginMutation.mutate(credentials)
  const register = (userData: RegisterData) => registerMutation.mutate(userData)
  
  const logout = () => {
    return new Promise<void>((resolve, reject) => {
      logoutMutation.mutate(undefined, {
        onSuccess: () => {
          resolve()
        },
        onError: (error) => {
          reject(error)
        }
      })
    })
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    loginLoading: loginMutation.isLoading,
    registerLoading: registerMutation.isLoading,
    logoutLoading: logoutMutation.isLoading,
  }
}
