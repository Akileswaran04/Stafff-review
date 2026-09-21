/** Five filled dots, same size and spacing everywhere: solid brass lit, dark slot with a hairline ring unlit. */
export default function RatingDots({ rating, size = 10, className = "" }: { rating: number; size?: number; className?: string }) {
  return (
    <span role="img" aria-label={`${rating} out of 5`} className={`inline-flex shrink-0 items-center gap-[6px] ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`rounded-full ${n <= rating ? "dot-on" : "dot-off"}`} style={{ width: size, height: size }} />
      ))}
    </span>
  );
}
