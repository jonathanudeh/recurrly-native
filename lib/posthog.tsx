import PostHog, { PostHogProvider } from "posthog-react-native";
import type { PropsWithChildren } from "react";

const projectToken = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;

const missingConfiguration = [
  !projectToken && "EXPO_PUBLIC_POSTHOG_KEY",
  !host && "EXPO_PUBLIC_POSTHOG_HOST",
].filter(Boolean) as string[];

if (__DEV__ && missingConfiguration.length > 0) {
  throw new Error(
    missingConfiguration
      .map(
        (variable) =>
          `${variable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${variable} is configured`,
      )
      .join("\n"),
  );
}

export const posthog =
  missingConfiguration.length === 0
    ? new PostHog(projectToken!, {
        host: host!,
        logs: {
          serviceName: "recurrly-mobile",
          environment: __DEV__ ? "development" : "production",
        },
        errorTracking: {
          autocapture: {
            uncaughtExceptions: true,
            unhandledRejections: true,
            console: [],
          },
        },
      })
    : undefined;

export const posthogLogger = {
  info(message: string, attributes: Record<string, string>) {
    posthog?.logger.info(message, attributes);
  },
};

export function PostHogRootProvider({ children }: PropsWithChildren) {
  if (!posthog) {
    return children;
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
