import clsx from "clsx";
import { Image, Pressable, Text, View } from "react-native";
import {
  formatCurrency,
  formatStatusLabel,
  formatSubscriptionDateTime,
} from "../lib/util";

function SubscriptionCard({
  name,
  price,
  currency,
  icon,
  billing,
  color,
  category,
  plan,
  paymentMethod,
  status,
  startDate,
  renewalDate,
  expanded,
  onPress,
}: SubscriptionCardProps) {
  const SUB_ROWS = [
    { label: "Payments", value: paymentMethod?.trim() },
    { label: "Category", value: category?.trim() || plan?.trim() },
    {
      label: "Started",
      value: startDate ? formatSubscriptionDateTime(startDate) : "",
    },
    {
      label: "Renewal date",
      value: renewalDate ? formatSubscriptionDateTime(renewalDate) : "",
    },
    {
      label: "Status",
      value: status ? formatStatusLabel(status) : "",
    },
  ];

  return (
    <Pressable
      onPress={onPress}
      className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image source={icon} className="sub-icon" />
          <View className="sub-copy">
            <Text numberOfLines={1} className="sub-title">
              {name}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {category?.trim() ||
                plan?.trim() ||
                (renewalDate && formatSubscriptionDateTime(renewalDate))}
            </Text>
          </View>
        </View>

        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </View>

      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            {SUB_ROWS.map(({ label, value }) => (
              <View className="sub-row" key={label}>
                <View className="sub-row-copy">
                  <Text className="sub-label">{label}:</Text>
                  <Text
                    className="sub-value"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {value?.trim()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </Pressable>
  );
}

export default SubscriptionCard;
