const FlashCard = ({ tag, question, back, rotate = '' }) => {
    return (
        <div className={`w-[420px] h-[260px] bg-white border-2 border-black shadow-[8px_8px_0_black] p-10 flex flex-col justify-between ${rotate}`}>
            <div className="text-lg font-bold text-accent">{tag}</div>
            <div className="text-3xl font-bold text-black">{question}</div>
            <div className="flex justify-between text-lg text-black/40">
                <span>{back}</span>
                <span className="text-accent font-bold">FLIP →</span>
            </div>
        </div>
    )
}

export default FlashCard
