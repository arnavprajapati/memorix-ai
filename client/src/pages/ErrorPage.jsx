import { useRouteError, Link } from 'react-router-dom'

const ErrorPage = () => {
    const error = useRouteError()
    const is404 = error?.status === 404

    return (
        <div className="relative min-h-screen bg-white flex items-center justify-center px-8">
            <div className="retro-grid absolute inset-0" />

            <div className="relative z-10 text-center max-w-lg">
                <div className="text-[clamp(80px,18vw,160px)] font-extrabold text-black/8 leading-none select-none" style={{ fontFamily: 'Athletics, sans-serif' }}>
                    {is404 ? '404' : 'ERR'}
                </div>

                <div className="border-2 border-black shadow-[8px_8px_0_black] bg-white px-10 py-10 -mt-8 relative z-10">
                    <div className="inline-block mb-6 text-sm font-bold tracking-widest text-accent border-2 border-accent px-4 py-1 bg-accent-light uppercase">
                        {is404 ? 'Page Not Found' : 'Something Went Wrong'}
                    </div>

                    <h1 className="text-4xl text-black mb-4">
                        {is404 ? 'This page doesn\'t exist.' : 'An unexpected error occurred.'}
                    </h1>

                    <p className="text-base text-black/40 mb-8">
                        {error?.statusText || error?.message || 'We\'re not sure what happened.'}
                    </p>

                    <Link to="/" className="retro-btn bg-accent text-black shadow-[5px_5px_0_black] hover:shadow-[8px_8px_0_black] inline-block">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ErrorPage
