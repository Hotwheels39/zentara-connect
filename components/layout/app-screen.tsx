import * as React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cn } from "@/lib/utils";

type AppScreenProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  scroll?: boolean;
};

export function AppScreen({
  children,
  className,
  contentClassName,
  scroll = true,
}: AppScreenProps) {
  const content = (
    <View className={cn("w-full self-center px-5 pb-8 pt-4 web:max-w-xl", contentClassName)}>
      {children}
    </View>
  );

  return (
    <SafeAreaView className={cn("flex-1 bg-background", className)}>
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
