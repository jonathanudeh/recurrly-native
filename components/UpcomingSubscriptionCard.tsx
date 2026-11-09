import { Image, Text, View } from "react-native";
import { formatCurrency } from "../lib/util";

function UpcomingSubscriptionCard({
  name,
  price,
  daysLeft,
  icon,
  currency,
}: UpcomingSubscription) {
  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <Image source={icon} className="upcoming-icon" />
        <View className="">
          <Text className="upcoming-price">
            {formatCurrency(price, currency)}
          </Text>
          <Text className="upcoming-meta" numberOfLines={1}>
            {daysLeft === 0
              ? "Today"
              : daysLeft === 1
                ? "Tomorrow"
                : `${daysLeft} days left`}
          </Text>
        </View>
      </View>

      <Text className="upcoming-name" numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

export default UpcomingSubscriptionCard;
