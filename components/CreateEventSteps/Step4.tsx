import { Step4Props } from "@/types/stepTypes";
import { TouchableOpacity, View, Text, TextInput } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from 'expo-haptics'
import DateTimePicker from '@react-native-community/datetimepicker'
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { memo } from "react";



const Step4 = memo(({
  eventData,
  setEventData,
  showPromoEndDatePicker,
  setShowPromoEndDatePicker,
  handlePromoEndDateChange,
  formatDate
}: Step4Props) => {
  return (
    <Animated.View entering={FadeInDown.duration(500)} className="px-4 py-6">
      <Text className="text-white text-2xl font-extrabold mb-6">
        Étape 4/5 : Promotion
      </Text>

      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-white text-lg font-medium">Activer une promotion</Text>
        <TouchableOpacity
          className={`w-14 h-7 rounded-full p-1 flex justify-center ${eventData.isPromo ? 'bg-teal-400' : 'bg-gray-700'}`}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            setEventData({ ...eventData, isPromo: !eventData.isPromo })
          }}
          activeOpacity={0.7}
        >
          <View
            className={`bg-white w-5 h-5 rounded-full shadow ${eventData.isPromo ? 'ml-7' : 'ml-0'
              }`}
            style={{ transition: 'margin-left 0.3s' }}
          />
        </TouchableOpacity>
      </View>

      {eventData.isPromo && (
        <View className="space-y-6">
          <View className="flex-row justify-between space-x-4">
            <View className="flex-1">
              <Text className="text-teal-400 text-lg mb-2 font-medium">Pourcentage de réduction</Text>
              <TextInput
                className="bg-white/10 text-white p-5 rounded-2xl text-lg"
                placeholder="Ex: 20"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                value={eventData.promoDiscount ? eventData.promoDiscount.toString() : ''}
                onChangeText={text =>
                  setEventData({ ...eventData, promoDiscount: parseInt(text) || 0 })
                }
              />
            </View>

            <View className="flex-1">
              <Text className="text-teal-400 text-lg mb-2 font-medium">Fin de la promotion</Text>
              <TouchableOpacity
                className="bg-white/10 p-5 rounded-2xl flex-row justify-between items-center"
                onPress={() => setShowPromoEndDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text className="text-white text-lg">{formatDate(eventData.promoEndDate)}</Text>
                <MaterialCommunityIcons name="calendar" size={28} color="#68f2f4" />
              </TouchableOpacity>
              {showPromoEndDatePicker && (
                <DateTimePicker
                  value={eventData.promoEndDate}
                  mode="date"
                  display="default"
                  onChange={handlePromoEndDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>
          </View>

          <View className="bg-teal-400/10 p-4 rounded-2xl">
            <Text className="text-teal-400 text-base">
              La promotion sera automatiquement désactivée après la date de fin spécifiée.
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
});

Step4.displayName = "Step4";
export default Step4