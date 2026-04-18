import { Link } from 'react-router-dom'

const AuthLayout = ({ title, subtitle, footer, children }) => (
    <div className="relative min-h-screen bg-white flex items-center justify-center px-4">
        <div className="retro-grid absolute inset-0" />
        <div className="relative z-10 w-full max-w-md">
            <Link
                to="/"
                className="block text-center mb-10 text-3xl font-bold tracking-tight no-underline text-black"
                style={{ fontFamily: 'Athletics, sans-serif' }}
            >
                MEMORIX<span className="text-accent">.</span>
            </Link>
            <div className="bg-white border-2 border-black shadow-[8px_8px_0_black] p-10">
                <h2 className="text-4xl text-black mb-2">{title}</h2>
                <p className="text-base text-black/40 mb-10">{subtitle}</p>
                {children}
                <p className="text-sm text-black/40 text-center mt-8">{footer}</p>
            </div>
        </div>
    </div>
)

export default AuthLayout
