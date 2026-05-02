type BadgeStatus = "Active" | "Inactive" | "Beta";

interface BadgeProps {
  status: BadgeStatus | string;
}

export default function Badge({ status }: BadgeProps) {
  const map: Record<BadgeStatus, string> = {
    Active: "badge-active",
    Inactive: "badge-inactive",
    Beta: "badge-beta",
  };

  const dotColor: Record<BadgeStatus, string> = {
    Active: "bg-emerald-500",
    Inactive: "bg-zinc-400",
    Beta: "bg-amber-500",
  };

  const safeStatus = status as BadgeStatus;

  return (
    <span className={map[safeStatus] || "badge-inactive"}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor[safeStatus] || "bg-zinc-400"}`} />
      {status}
    </span>
  );
}
