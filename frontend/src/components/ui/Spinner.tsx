export default function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "h-5 w-5", md: "h-10 w-10", lg: "h-16 w-16" }[size];
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-esatic-blue ${s}`} />
    </div>
  );
}
