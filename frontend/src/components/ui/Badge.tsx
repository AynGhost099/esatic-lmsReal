import clsx from "clsx";

type Color = "blue" | "green" | "red" | "orange" | "gray" | "purple";

interface BadgeProps {
  label?: string;
  children?: React.ReactNode;
  color?: Color;
  variant?: Color;
  className?: string;
}

const colors: Record<Color, string> = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-700",
  orange: "bg-orange-50 text-orange-700",
  gray: "bg-gray-100 text-gray-600",
  purple: "bg-purple-50 text-purple-700",
};

export default function Badge({ label, children, color, variant = "blue", className }: BadgeProps) {
  const resolvedColor = color ?? variant;
  return (
    <span className={clsx("inline-block px-2.5 py-0.5 text-xs font-medium rounded-full", colors[resolvedColor], className)}>
      {children ?? label}
    </span>
  );
}
