export async function getExpoPushToken(): Promise<string | null> {
  // Push tokens are not available on web
  return null;
}
