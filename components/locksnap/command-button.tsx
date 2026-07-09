import * as React from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import LucideIcon, { type IconName } from "@/lib/icons/LucideIcon";
import { cn } from "@/lib/utils";

type CommandButtonProps = React.ComponentProps<typeof Button> & {
  title: string;
  description: string;
  icon: IconName;
};

export function CommandButton({
  title,
  description,
  icon,
  className,
  ...props
}: CommandButtonProps) {
  return (
    <Button
      variant="outline"
      size="lg"
      className={cn(
        "h-auto justify-start rounded-3xl border-border/80 bg-card px-4 py-4",
        className,
      )}
      {...props}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
          <LucideIcon name={icon} className="text-foreground" size={20} strokeWidth={2.2} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">{title}</Text>
          <Text className="mt-1 text-sm leading-5 text-muted-foreground">{description}</Text>
        </View>
      </View>
    </Button>
  );
}
