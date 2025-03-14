// services/axios/instance.js
'use client'

import axios from 'axios'
import { createBrowserSupabaseClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// Create the Supabase client
const supabase = createBrowserSupabaseClient()

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API || 'http://54.38.189.103:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (config.data) {
        console.log('Request data:', config.data)
      }
      
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
      }
      
      return config
    } catch (error) {
      console.error('Auth error in request interceptor:', error)
      return config
    }
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Handle responses and errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    // Handle 401 errors by redirecting to auth page
    if (error.response?.status === 401) {
      try {
        await supabase.auth.signOut()
        
        // Use window.location.replace for a clean redirect
        window.location.replace('/auth')
        
        toast.error('Session expired. Please login again.')
      } catch (signOutError) {
        console.error('Error during sign out:', signOutError)
        // Still redirect even if sign out fails
        window.location.replace('/auth')
      }
    }
    
    // Log the error with more context
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    })
    
    return Promise.reject(error)
  }
)

export default axiosInstance