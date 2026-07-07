import { Navigate } from 'react-router-dom'
import { useAuth } from '../api/AuthContext'

export default function ProtectedRoute({
                                           children,
                                       }: {
    children: React.ReactNode
}) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return <div>Loading...</div>
    }
    console.log('ProtectedRoute render')
    return isAuthenticated
        ? <>{children}</>
        : <Navigate to="/login" replace />
}
