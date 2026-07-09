import * as React from "react";
import { router } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import * as WebBrowser from "expo-web-browser";

import { AppScreen } from "@/components/layout/app-screen";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ZentaraLogo } from "@/components/zentara-logo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ACCOUNT_DELETION_URL = "https://www.pcelectronics.net/delete-account-request";

export default function SettingsScreen() {
  const { isLoading: isAuthLoading, user } = useAuth();

  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, user]);

  if (isAuthLoading || !user) {
    return (
      <AppScreen contentClassName="flex-1 items-center justify-center py-10">
        <ActivityIndicator />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View className="gap-6">
        <View className="items-center pt-2">
          <ZentaraLogo size="sm" />
        </View>

        <View className="gap-1">
          <Text className="text-xl font-semibold text-foreground">Settings</Text>
          <Text className="text-sm text-muted-foreground">
            Manage your account and preferences.
          </Text>
        </View>

        <View className="gap-4 rounded-3xl border border-border bg-card p-5">
          <View className="gap-1">
            <Text className="text-sm text-muted-foreground">Account</Text>
            <Text className="text-base font-medium text-foreground">
              {user.email || "No email found"}
            </Text>
          </View>

          <View className="border-t border-border pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="lg">
                  <Text className="text-button text-destructive-foreground">Delete Account</Text>
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    To delete your Zentara Connect account and associated data, please submit an
                    account deletion request.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    <Text>Cancel</Text>
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onPress={() => {
                      void WebBrowser.openBrowserAsync(ACCOUNT_DELETION_URL);
                    }}
                  >
                    <Text>Open Account Deletion Page</Text>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </View>
        </View>
      </View>
    </AppScreen>
  );
}
