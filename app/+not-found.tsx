import { router } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotFoundScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <Card className="w-full max-w-sm border-border/80 bg-card">
          <CardHeader className="items-center">
            <CardTitle className="text-h2 text-card-foreground">Page not found</CardTitle>
            <CardDescription className="text-body text-muted-foreground">
              The screen you requested is not available in this build.
            </CardDescription>
          </CardHeader>
          <CardContent className="items-center">
            <Text className="text-caption text-center text-muted-foreground">
              Use the main flow to return to LockSnap.
            </Text>
          </CardContent>
          <CardFooter className="gap-3">
            <Button onPress={() => router.replace("/login")} className="flex-1">
              <Text className="text-button text-primary-foreground">Go to sign in</Text>
            </Button>
            <Button variant="outline" onPress={() => router.back()} className="flex-1">
              <Text className="text-button text-foreground">Go back</Text>
            </Button>
          </CardFooter>
        </Card>
      </View>
    </SafeAreaView>
  );
}
