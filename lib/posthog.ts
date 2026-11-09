import PostHog from "posthog-react-native";

const projectToken = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;
const missingVariable = projectToken
  ? "EXPO_PUBLIC_POSTHOG_HOST"
  : "EXPO_PUBLIC_POSTHOG_KEY";
const isPostHogConfigured = Boolean(projectToken && host);

if (!isPostHogConfigured && __DEV__) {
  throw new Error(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  );
}

export const posthog = isPostHogConfigured
  ? new PostHog(projectToken!, {
      host: host!,
      captureAppLifecycleEvents: true,
      logs: {
        serviceName: "recurrly-mobile",
        environment: __DEV__ ? "development" : "production",
      },
      errorTracking: {
        autocapture: {
          uncaughtExceptions: true,
          unhandledRejections: true,
          // Rendering errors are captured by the root PostHogErrorBoundary.
          console: [],
        },
      },
      debug: __DEV__,
    })
  : undefined;

type PostHogLogAttributes = Record<string, string | number | boolean>;

// This dedicated logger is the only path that exports logs added by this integration.
export const posthogLogger = {
  info(message: string, attributes?: PostHogLogAttributes) {
    posthog?.logger.info(message, attributes);
  },
};
