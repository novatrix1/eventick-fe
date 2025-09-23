import { Step2Props } from "@/types/stepTypes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import DateTimePicker from '@react-native-community/datetimepicker'
import { memo } from "react";


const Step2 = memo(({
  eventData,
  setEventData,
  showDatePicker,
  setShowDatePicker,
  showStartTimePicker,
  setShowStartTimePicker,
  showEndTimePicker,
  setShowEndTimePicker,
  handleDateChange,
  handleStartTimeChange,
  handleEndTimeChange,
  formatDate,
  formatTime
}: Step2Props) => {
  return (
    <Animated.View entering={FadeInDown.duration(500)} className="px-4 py-6">
      <Text className="text-white text-2xl font-extrabold mb-6">
        Étape 2/5 : Date et heure
      </Text>

      <View className="space-y-6">
        <View>
          <Text className="text-teal-400 text-lg mb-2 font-medium">Date</Text>
          <TouchableOpacity
            className="bg-white/10 p-5 rounded-2xl flex-row justify-between items-center"
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text className="text-white text-lg">{formatDate(eventData.date)}</Text>
            <MaterialCommunityIcons name="calendar" size={28} color="#68f2f4" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={eventData.date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View className="flex-row justify-between space-x-4">
          <View className="flex-1">
            <Text className="text-teal-400 text-lg mb-2 font-medium">Heure de début</Text>
            <TouchableOpacity
              className="bg-white/10 p-5 rounded-2xl flex-row justify-between items-center"
              onPress={() => setShowStartTimePicker(true)}
              activeOpacity={0.7}
            >
              <Text className="text-white text-lg">{formatTime(eventData.startTime)}</Text>
              <MaterialCommunityIcons name="clock" size={28} color="#68f2f4" />
            </TouchableOpacity>
            {showStartTimePicker && (
              <DateTimePicker
                value={eventData.startTime}
                mode="time"
                display="default"
                onChange={handleStartTimeChange}
              />
            )}
          </View>

          <View className="flex-1">
            <Text className="text-teal-400 text-lg mb-2 font-medium">Heure de fin</Text>
            <TouchableOpacity
              className="bg-white/10 p-5 rounded-2xl flex-row justify-between items-center"
              onPress={() => setShowEndTimePicker(true)}
              activeOpacity={0.7}
            >
              <Text className="text-white text-lg">{formatTime(eventData.endTime)}</Text>
              <MaterialCommunityIcons name="clock" size={28} color="#68f2f4" />
            </TouchableOpacity>
            {showEndTimePicker && (
              <DateTimePicker
                value={eventData.endTime}
                mode="time"
                display="default"
                onChange={handleEndTimeChange}
                minimumDate={eventData.startTime}
              />
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
});

Step2.displayName = "Step2";
export default Step2