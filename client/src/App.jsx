import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/routing/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ErrorPage from './pages/ErrorPage'

const router = createBrowserRouter([
    {
        path: '/',
        element: <AuthProvider />,
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <LandingPage /> },
            { path: 'signup', element: <SignupPage /> },
            { path: 'login', element: <LoginPage /> },
            {
                path: 'dashboard',
                element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
            },
        ],
    },
])

const App = () => <RouterProvider router={router} />

export default App

