import { Image, View } from "react-native";
import { Text } from "@/components/ui/text";

type ZentaraLogoProps = {
  size?: "sm" | "md";
};

export function ZentaraLogo({ size = "md" }: ZentaraLogoProps) {
  const iconSize = size === "sm" ? 36 : 48;
  const titleSize = size === "sm" ? "text-lg" : "text-2xl";
  const subtitleSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <View className="flex-row items-center gap-3">
      <Image
        source={require("@/assets/zentara_icon_clean.png")}
        style={{ width: iconSize, height: iconSize, borderRadius: 10 }}
      />
      <View>
        <Text
          className={`${titleSize} font-bold tracking-wider text-foreground`}
          style={{ fontFamily: "Inter_700Bold", letterSpacing: 2 }}
        >
          ZENTARA
        </Text>
        <Text
          className={`${subtitleSize} text-primary`}
          style={{ fontFamily: "Inter_500Medium", letterSpacing: 1 }}
        >
          CONNECT
        </Text>
      </View>
    </View>
  );
}
