import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import CreateSubscriptionModal from "../../../components/CreateSubscriptionModal";
import ListHeading from "../../../components/ListHeading";
import SubscriptionCard from "../../../components/SubscriptionCard";
import UpcomingSubscriptionCard from "../../../components/UpcomingSubscriptionCard";
import {
  HOME_BALANCE,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "../../../constants/data";
import { useSubscriptions } from "../../../components/SubscriptionsContext";
import { icons } from "../../../constants/icons";
import images from "../../../constants/images";
import { posthog } from "../../../lib/posthog";
import { formatCurrency } from "../../../lib/util";

const SafeAreaView = styled(RNSafeAreaView);

export default function Index() {
  const { subscriptions, addSubscription } = useSubscriptions();
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [expendedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

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
              <ListHeading title="Upcoming" />

              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
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

            <ListHeading title="All Subscriptions" />
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
