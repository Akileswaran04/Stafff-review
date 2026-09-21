/** Five filled dots, same size and spacing everywhere: solid brass lit, dark slot with a hairline ring unlit. */
export default function RatingDots({ rating, size = 10 }: { rating: number; size?: number }) {
  return (
    <span role="img" aria-label={`${rating} out of 5`} className="inline-flex shrink-0 items-center gap-[6px]">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className="rounded-full" style={{ width: size, height: size, background: n <= rating ? "#D4A574" : "#2A2C38", boxShadow: n <= rating ? "none" : "inset 0 0 0 1px #3A3C4A" }} />
      ))}
    </span>
  );
}
