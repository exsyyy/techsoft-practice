import React, { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../api/authService'

interface AuthContextType {
    isAuthenticated: boolean
    username: string | null
    login: (username: string, password?: string) => Promise<void>
    register: (username: string, email: string, password?: string) => Promise<void>
    logout: () => void
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [username, setUsername] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        const checkAuth = () => {
            const authStatus = authService.isAuthenticated()
            setIsAuthenticated(authStatus)
            if (authStatus) {
                setUsername(authService.getCurrentUsername())
            }
            setIsLoading(false)
        }
        checkAuth()
    }, [])

    const login = async (user: string, pass?: string) => {
        await authService.login(user, pass)
        setIsAuthenticated(true)
        setUsername(user)
    }

    const register = async (user: string, email: string, pass?: string) => {
        await authService.register(user, email, 'editor', pass)
    }

    const logout = () => {
        authService.logout()
        setIsAuthenticated(false)
        setUsername(null)
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, username, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}