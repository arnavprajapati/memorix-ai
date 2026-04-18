import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/routing/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import NewDeckPage from './pages/NewDeckPage'
import DeckPage from './pages/DeckPage'
import StudyPage from './pages/StudyPage'
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
            {
                path: 'new-deck',
                element: <ProtectedRoute><NewDeckPage /></ProtectedRoute>,
            },
            {
                path: 'deck/:deckId',
                element: <ProtectedRoute><DeckPage /></ProtectedRoute>,
            },
            {
                path: 'study/:deckId',
                element: <ProtectedRoute><StudyPage /></ProtectedRoute>,
            },
        ],
    },
])

const App = () => <RouterProvider router={router} />

export default App

