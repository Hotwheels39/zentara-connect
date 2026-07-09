import * as React from "react";
import { View } from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import LucideIcon, { type IconName } from "@/lib/icons/LucideIcon";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  description?: string;
  icon?: IconName;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function SectionCard({
  title,
  description,
  icon,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card
      className={cn("rounded-3xl border-border/80 bg-card shadow-sm shadow-black/5", className)}
    >
      <CardHeader className="gap-3 pb-4">
        <View className="flex-row items-center gap-3">
          {icon ? (
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary/12">
              <LucideIcon name={icon} className="text-primary" size={20} strokeWidth={2.25} />
            </View>
          ) : null}
          <View className="flex-1">
            <CardTitle>{title}</CardTitle>
            {description ? (
              <Text className="mt-1 text-sm leading-5 text-muted-foreground">{description}</Text>
            ) : null}
          </View>
        </View>
      </CardHeader>
      <CardContent className={cn("pt-0", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
