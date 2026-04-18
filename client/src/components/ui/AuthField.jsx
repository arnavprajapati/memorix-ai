const AuthField = ({ label, name, type = 'text', value, onChange, placeholder, autoComplete }) => (
    <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-black tracking-widest uppercase">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="border-2 border-black px-5 py-4 text-base font-semibold text-black bg-white outline-none focus:border-accent transition-colors placeholder:text-black/30"
        />
    </div>
)

export default AuthField
