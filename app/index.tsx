import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/components/providers/AuthProvider";
import { Text } from "@/components/ui/text";
import { missingSupabaseConfigMessage } from "@/lib/supabase";

export default function IndexScreen() {
  const { isConfigured, isLoading, user } = useAuth();

  if (!isConfigured) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center text-body text-foreground">
          {missingSupabaseConfigMessage}
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background">
        <ActivityIndicator />
        <Text className="text-body text-muted-foreground">Loading session...</Text>
      </View>
    );
  }

  return <Redirect href={user ? "/dashboard" : "/login"} />;
}
