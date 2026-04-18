import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AuthLayout from '../components/layout/AuthLayout'
import AuthField from '../components/ui/AuthField'
import Toast from '../components/ui/Toast'

const LoginPage = () => {
    const { signIn } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')
        if (!form.email.trim() || !form.password.trim()) return setError('All fields are required.')
        setLoading(true)
        try {
            await signIn(form)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message || 'Invalid email or password.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Pick up where you left off."
            footer={<>Don&apos;t have an account?{' '}<Link to="/signup" className="text-black font-bold underline hover:text-accent transition-colors">Sign up</Link></>}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                <AuthField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" />
                <AuthField label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Your password" autoComplete="current-password" />
                {error && <Toast message={error} onClose={() => setError('')} />}
                <button
                    type="submit"
                    disabled={loading}
                    className="retro-btn bg-accent text-black shadow-[5px_5px_0_black] hover:shadow-[8px_8px_0_black] w-full text-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? 'Logging In...' : 'Log In →'}
                </button>
            </form>
        </AuthLayout>
    )
}

export default LoginPage
