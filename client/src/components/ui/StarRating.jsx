const StarRating = ({ count }) => (
    <div className="flex gap-1 mb-4">
        {Array.from({ length: count }).map((_, i) => (
            <span key={i} className="text-accent text-xl">★</span>
        ))}
    </div>
)

export default StarRating
