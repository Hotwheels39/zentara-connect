import { View } from "react-native";
import { Text } from "@/components/ui/text";
import LucideIcon, { type IconName } from "@/lib/icons/LucideIcon";
import { cn } from "@/lib/utils";

type StatusTone = "neutral" | "success" | "warning" | "danger";

const toneClasses: Record<StatusTone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
};

type StatusPillProps = {
  label: string;
  icon?: IconName;
  tone?: StatusTone;
};

export function StatusPill({ label, icon = "ShieldAlert", tone = "neutral" }: StatusPillProps) {
  return (
    <View
      className={cn("self-start rounded-full border border-border/70 px-3 py-2", toneClasses[tone])}
    >
      <View className="flex-row items-center gap-2">
        <LucideIcon name={icon} size={16} strokeWidth={2.2} />
        <Text className="text-sm font-medium">{label}</Text>
      </View>
    </View>
  );
}
