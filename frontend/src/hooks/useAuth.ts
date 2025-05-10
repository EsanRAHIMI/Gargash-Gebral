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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // Fetch the current user
  const { data: user, isLoading, error } = useQuery<User>(
    'user',
    async () => {
      const { data } = await axios.get(`${authUrl}/verify`)
      return data
    },
    {
      retry: false,
      onSuccess: () => setIsAuthenticated(true),
      onError: () => setIsAuthenticated(false),
    }
  )

  // Login mutation
  const loginMutation = useMutation(
    (credentials: LoginData) => axios.post(`${authUrl}/login`, credentials),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user')
        setIsAuthenticated(true)
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
      },
    }
  )

  const login = (credentials: LoginData) => loginMutation.mutate(credentials)
  const register = (userData: RegisterData) => registerMutation.mutate(userData)
  
  // Return a Promise to ensure we can await the logout operation
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