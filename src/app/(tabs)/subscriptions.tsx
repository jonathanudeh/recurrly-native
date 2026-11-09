import { styled } from "nativewind";
import { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import SubscriptionCard from "../../../components/SubscriptionCard";
import { useSubscriptions } from "../../../components/SubscriptionsContext";
import { posthog } from "../../../lib/posthog";

const SafeAreaView = styled(RNSafeAreaView);

export default function Subscriptions() {
  const { subscriptions } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return subscriptions;

    return subscriptions.filter((subscription) =>
      [
        subscription.name,
        subscription.category,
        subscription.plan,
        subscription.status,
      ].some((value) => value?.toLowerCase().includes(query)),
    );
  }, [searchQuery, subscriptions]);

  return (
    <SafeAreaView className="bg-background flex-1 p-5">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Text className="list-title mb-5">Subscriptions</Text>

        <View className="auth-input-wrap mb-3">
          <TextInput
            accessibilityLabel="Search subscriptions"
            autoCapitalize="none"
            className="auth-input"
            onChangeText={setSearchQuery}
            placeholder="Search by name, category, or status"
            placeholderTextColor="#77715f"
            returnKeyType="search"
            value={searchQuery}
          />
        </View>

        <Text className="subscription-count">
          {filteredSubscriptions.length}{" "}
          {filteredSubscriptions.length === 1
            ? "subscription"
            : "subscriptions"}
        </Text>

        <FlatList
          data={filteredSubscriptions}
          renderItem={({ item }) => (
            <SubscriptionCard
              {...item}
              expanded={expandedSubscriptionId === item.id}
              onPress={() => {
                const isExpanded = expandedSubscriptionId !== item.id;
                posthog?.capture("subscription_details_toggled", {
                  is_expanded: isExpanded,
                  subscription_status: item.status ?? "unknown",
                  billing_interval: item.billing.toLowerCase(),
                });
                setExpandedSubscriptionId(isExpanded ? item.id : null);
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          extraData={expandedSubscriptionId}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="pb-30"
          ListEmptyComponent={
            <Text className="home-empty-state">
              {subscriptions.length === 0
                ? "No subscriptions yet."
                : "No subscriptions match your search."}
            </Text>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
