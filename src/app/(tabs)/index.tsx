import dayjs from "dayjs";
import { router } from "expo-router";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import CreateSubscriptionModal from "../../../components/CreateSubscriptionModal";
import ListHeading from "../../../components/ListHeading";
import SubscriptionCard from "../../../components/SubscriptionCard";
import UpcomingSubscriptionCard from "../../../components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_USER,
} from "../../../constants/data";
import { useSubscriptions } from "../../../components/SubscriptionsContext";
import { icons } from "../../../constants/icons";
import images from "../../../constants/images";
import { posthog } from "../../../lib/posthog";
import { formatCurrency } from "../../../lib/util";

const SafeAreaView = styled(RNSafeAreaView);

function getUpcomingSubscriptions(subscriptions: Subscription[]) {
  const today = dayjs();

  return subscriptions
    .flatMap((subscription) => {
      if (subscription.status?.toLowerCase() !== "active") return [];

      const billingFrequency = (
        subscription.frequency ?? subscription.billing
      ).toLowerCase();
      const interval =
        billingFrequency === "monthly"
          ? "month"
          : billingFrequency === "yearly"
            ? "year"
            : null;
      if (!interval) return [];

      const renewalDate = subscription.renewalDate
        ? dayjs(subscription.renewalDate)
        : subscription.startDate
          ? dayjs(subscription.startDate).add(1, interval)
          : null;
      if (!renewalDate?.isValid()) return [];

      const nextRenewal =
        renewalDate.isBefore(today)
          ? renewalDate.add(
              Math.floor(today.diff(renewalDate, interval)) + 1,
              interval,
            )
          : renewalDate;
      const daysLeft = Math.max(
        0,
        nextRenewal.startOf("day").diff(today.startOf("day"), "day"),
      );

      return [
        {
          ...subscription,
          daysLeft,
          nextRenewalTimestamp: nextRenewal.valueOf(),
        },
      ];
    })
    .sort(
      (first, second) =>
        first.nextRenewalTimestamp - second.nextRenewalTimestamp,
    );
}

export default function Index() {
  const { subscriptions, addSubscription } = useSubscriptions();
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [expendedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const upcomingSubscriptions = useMemo(
    () => getUpcomingSubscriptions(subscriptions),
    [subscriptions],
  );

  return (
    <SafeAreaView className="bg-background flex-1 p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image source={images.avatar} className="home-avatar" />
                <Text className="home-user-name">{HOME_USER.name}</Text>
              </View>

              <Pressable
                accessibilityLabel="Create subscription"
                accessibilityRole="button"
                className="home-add-icon"
                onPress={() => setCreateModalVisible(true)}
              >
                <Image source={icons.add} className="size-full" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading
                onPress={() => router.push("/(tabs)/subscriptions")}
                title="Upcoming"
              />

              <FlatList
                data={upcomingSubscriptions}
                renderItem={({ item }) => {
                  return <UpcomingSubscriptionCard {...item} />;
                }}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals yet.
                  </Text>
                }
              />
            </View>

            <ListHeading
              onPress={() => router.push("/(tabs)/subscriptions")}
              title="All Subscriptions"
            />
          </>
        )}
        data={subscriptions}
        renderItem={({ item }) => {
          return (
            <SubscriptionCard
              {...item}
              expanded={expendedSubscriptionId === item.id}
              onPress={() => {
                const isExpanded = expendedSubscriptionId !== item.id;
                posthog?.capture("subscription_details_toggled", {
                  is_expanded: isExpanded,
                  subscription_status: item.status ?? "unknown",
                  billing_interval: item.billing.toLowerCase(),
                });
                setExpandedSubscriptionId(isExpanded ? item.id : null);
              }}
            />
          );
        }}
        keyExtractor={(item) => item.id}
        extraData={expendedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscription yet</Text>
        }
        contentContainerClassName="pb-30"
      />
      <CreateSubscriptionModal
        onClose={() => setCreateModalVisible(false)}
        onCreate={addSubscription}
        visible={isCreateModalVisible}
      />
    </SafeAreaView>
  );
}
