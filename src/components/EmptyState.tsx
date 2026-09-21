export default function EmptyState() {
  return (
    <div className="grid place-items-center px-6 py-32 text-center">
      <span className="mb-8 block h-5 w-5 animate-breathe rounded-full bg-gold" aria-hidden />
      <p className="font-display text-4xl uppercase leading-tight text-cream sm:text-5xl">
        Your reviews will appear here
        <br />
        as they arrive.
      </p>
      <p className="mt-3 text-sm text-mute">Nothing yet, and that&rsquo;s perfectly fine.</p>
    </div>
  );
}
