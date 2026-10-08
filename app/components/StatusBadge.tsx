type MatchStatus = "No empezado" | "En directo" | "Finalizado";

type StatusBadgeProps = {
  status: MatchStatus;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colors: Record<MatchStatus, string> = {
    "No empezado": "bg-white text-black",
    "En directo": "bg-red-600 text-white",
    "Finalizado": "bg-green-600 text-white",
  };

  return (
    <span
      className={`rounded-full px-4 py-1 text-sm font-bold ${colors[status]}`}
    >
      {status}
    </span>
  );
}