import { Progress } from "@/components/ui/progress";

interface StatBarProps {
  icon: string;
  label: string;
  value: number;
  className?: string; // Untuk warna
}

export function StatBar({ icon, label, value, className }: StatBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {icon} {label}
        </span>
        <span className="text-sm font-bold text-gray-800">{value}%</span>
      </div>
      <Progress value={value} className={`h-3 ${className}`} />
    </div>
  );
}
