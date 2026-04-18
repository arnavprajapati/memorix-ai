import { useEffect, useState } from 'react'

const Toast = ({ message, type = 'error', onClose }) => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // animate in
        const show = setTimeout(() => setVisible(true), 10)
        // auto-dismiss after 3.5s
        const hide = setTimeout(() => {
            setVisible(false)
            setTimeout(onClose, 300)
        }, 3500)
        return () => { clearTimeout(show); clearTimeout(hide) }
    }, [onClose])

    const bg = type === 'success' ? 'bg-black text-white' : 'bg-accent text-black'

    return (
        <div
            className={`fixed top-6 right-6 z-9999 flex items-center gap-3 px-6 py-4 border-2 border-black shadow-[5px_5px_0_black] text-sm font-bold transition-all duration-300 ${bg} ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
            style={{ minWidth: '280px', maxWidth: '380px' }}
        >
            <span className="flex-1">{message}</span>
            <button
                onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
                className="text-base leading-none opacity-60 hover:opacity-100 bg-transparent border-none cursor-pointer font-bold"
            >
                ✕
            </button>
        </div>
    )
}

export default Toast
