import clsx from "clsx";
import dayjs from "dayjs";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { icons } from "../constants/icons";

const CATEGORIES = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const CATEGORY_COLORS: Record<(typeof CATEGORIES)[number], string> = {
  Entertainment: "#f5c542",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#b8e8d0",
  Productivity: "#f6eecf",
  Cloud: "#d6e8f5",
  Music: "#f7c5c5",
  Other: "#e8def8",
};

type Frequency = "Monthly" | "Yearly";

type CreateSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
};

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]>("Entertainment");

  const parsedPrice = Number(price.trim());
  const isValid =
    name.trim().length > 0 && Number.isFinite(parsedPrice) && parsedPrice > 0;

  const handleCreate = () => {
    const trimmedName = name.trim();
    const subscriptionPrice = Number(price.trim());
    if (
      !trimmedName ||
      !Number.isFinite(subscriptionPrice) ||
      subscriptionPrice <= 0
    ) {
      return;
    }

    const startDate = dayjs();
    const renewalDate = startDate
      .add(1, frequency === "Monthly" ? "month" : "year")
      .toISOString();

    onCreate({
      id: `subscription-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      name: trimmedName,
      price: subscriptionPrice,
      frequency,
      category,
      status: "active",
      startDate: startDate.toISOString(),
      renewalDate,
      icon: icons.wallet,
      billing: frequency,
      color: CATEGORY_COLORS[category],
    });

    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory("Entertainment");
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View className="modal-overlay justify-end">
        <Pressable
          accessibilityLabel="Close create subscription dialog"
          className="absolute inset-0"
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="w-full"
        >
          <View className="modal-container w-full">
            <View className="modal-header">
              <Text accessibilityRole="header" className="modal-title">
                New Subscription
              </Text>
              <Pressable
                accessibilityLabel="Close"
                accessibilityRole="button"
                className="modal-close"
                onPress={onClose}
              >
                <Text className="modal-close-text">×</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerClassName="modal-body"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <View className="auth-input-wrap">
                  <TextInput
                    accessibilityLabel="Name"
                    autoCapitalize="words"
                    className="auth-input"
                    onChangeText={setName}
                    placeholder="e.g. Netflix"
                    placeholderTextColor="#77715f"
                    returnKeyType="next"
                    selectionColor="#ea7a53"
                    value={name}
                  />
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <View className="auth-input-wrap">
                  <TextInput
                    accessibilityLabel="Price"
                    className="auth-input"
                    keyboardType="decimal-pad"
                    onChangeText={setPrice}
                    placeholder="0.00"
                    placeholderTextColor="#77715f"
                    returnKeyType="done"
                    selectionColor="#ea7a53"
                    value={price}
                  />
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  {(["Monthly", "Yearly"] as const).map((option) => {
                    const selected = frequency === option;
                    return (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        className={clsx(
                          "picker-option",
                          selected && "picker-option-active",
                        )}
                        key={option}
                        onPress={() => setFrequency(option)}
                      >
                        <Text
                          className={clsx(
                            "picker-option-text",
                            selected && "picker-option-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((option) => {
                    const selected = category === option;
                    return (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        className={clsx(
                          "category-chip",
                          selected && "category-chip-active",
                        )}
                        key={option}
                        onPress={() => setCategory(option)}
                      >
                        <Text
                          className={clsx(
                            "category-chip-text",
                            selected && "category-chip-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                className={clsx(
                  "auth-button",
                  !isValid && "auth-button-disabled",
                )}
                disabled={!isValid}
                onPress={handleCreate}
              >
                <Text className="auth-button-text">Create Subscription</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
