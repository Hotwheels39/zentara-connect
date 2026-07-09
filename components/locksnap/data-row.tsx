import { View } from "react-native";
import { Text } from "@/components/ui/text";
import LucideIcon, { type IconName } from "@/lib/icons/LucideIcon";
import { cn } from "@/lib/utils";

type DataRowProps = {
  label: string;
  value?: string;
  hint?: string;
  icon: IconName;
  className?: string;
};

export function DataRow({ label, value, hint, icon, className }: DataRowProps) {
  return (
    <View
      className={cn(
        "flex-row items-start gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3",
        className,
      )}
    >
      <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-xl bg-secondary">
        <LucideIcon name={icon} className="text-foreground" size={18} strokeWidth={2.1} />
      </View>
      <View className="flex-1">
        <Text className="text-sm text-muted-foreground">{label}</Text>
        <Text className="mt-1 text-base font-medium text-foreground">{value || "—"}</Text>
        {hint ? <Text className="mt-1 text-sm leading-5 text-muted-foreground">{hint}</Text> : null}
      </View>
    </View>
  );
}
