# Recurrly

**Take control of your subscriptions. Never lose track of what you're paying for.**

Recurrly is a subscription management application designed to help users keep track of recurring expenses, stay ahead of renewal dates, and get a clearer picture of where their money goes.

From streaming platforms and productivity tools to software plans and everyday digital services, Recurrly brings recurring payments into one organized space.

## Overview

Managing multiple subscriptions can quickly become difficult. Renewal dates get forgotten, small recurring charges add up, and it's easy to lose track of how much you're spending.

Recurrly aims to make subscription management simpler by providing a centralized place to organize subscriptions and monitor upcoming payments.

## Features

- **Subscription Management:** Keep recurring subscriptions organized in one place.
- **Renewal Tracking:** Stay informed about upcoming subscription renewals.
- **Spending Overview:** Get a clearer view of recurring expenses.
- **Subscription Dashboard:** View and manage subscriptions from a centralized interface.

## Tech Stack

- React Native
- Expo SDK 58
- TypeScript
- Expo Router
- NativeWind v5
- Tailwind CSS v4

## Getting Started

### Prerequisites

- Node.js
- npm
- Expo Go or an appropriate development build

### Installation

Clone the repository:

```bash
git clone <https://github.com/jonathanudeh/recurrly.git>
```

### Authentication

The app uses custom Recurrly sign-in and sign-up screens backed by Clerk. To run authentication locally:

1. In the selected Clerk application, enable the Native API and email/password sign-up and sign-in. Set sign-up verification to email verification code.
2. Add the application's **publishable** key to your local `.env` file:

   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

3. Start the app with `npx expo start`.

Never add a Clerk secret key to the mobile app or commit local environment files. The app stores session tokens with Expo SecureStore. Route guards control navigation in the client; any future API or private data service must independently verify Clerk session tokens on the server.
