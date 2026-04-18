import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-2xl font-bold text-black/30" style={{ fontFamily: 'Athletics, sans-serif' }}>
                    MEMORIX<span className="text-accent">.</span>
                </div>
            </div>
        )
    }

    return user ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute
