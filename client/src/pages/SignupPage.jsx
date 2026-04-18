import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AuthLayout from '../components/layout/AuthLayout'
import AuthField from '../components/ui/AuthField'
import Toast from '../components/ui/Toast'

const SignupPage = () => {
    const { signUp } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

    const handleSubmit = async e => {
        e.preventDefault()
        setError('')
        if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return setError('All fields are required.')
        if (form.password.length < 6) return setError('Password must be at least 6 characters.')
        setLoading(true)
        try {
            await signUp(form)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message || 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Start remembering everything."
            footer={<>Already have an account?{' '}<Link to="/login" className="text-black font-bold underline hover:text-accent transition-colors">Log in</Link></>}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                <AuthField label="Name" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" autoComplete="name" />
                <AuthField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" />
                <AuthField label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" autoComplete="new-password" />
                {error && <Toast message={error} onClose={() => setError('')} />}
                <button
                    type="submit"
                    disabled={loading}
                    className="retro-btn bg-accent text-black shadow-[5px_5px_0_black] hover:shadow-[8px_8px_0_black] w-full text-center disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating Account...' : 'Sign Up →'}
                </button>
            </form>
        </AuthLayout>
    )
}

export default SignupPage

