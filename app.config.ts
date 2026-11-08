import app from "./app.json";

const expoConfig = app.expo as typeof app.expo & {
  extra?: Record<string, unknown>;
};

export default {
  ...expoConfig,
  extra: {
    ...expoConfig.extra,
    posthogProjectToken: process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN,
    posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST,
  },
};
