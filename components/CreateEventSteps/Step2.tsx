import { Step2Props } from "@/types/stepTypes";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Text, View, Platform } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import DateTimePicker from '@react-native-community/datetimepicker';
import { memo, useState, useCallback, useMemo } from "react";

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
  const [touchedFields, setTouchedFields] = useState({
    date: false,
    startTime: false,
    endTime: false
  });

  // Validation des champs
  const isDateValid = eventData.date > new Date();
  const isStartTimeValid = eventData.startTime !== null;
  const isEndTimeValid = eventData.endTime !== null && 
    (eventData.startTime === null || eventData.endTime > eventData.startTime);

  // Fonctions pour gérer les interactions
  const handleFieldTouch = useCallback((field: keyof typeof touchedFields) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleDatePress = useCallback(() => {
    handleFieldTouch('date');
    setShowDatePicker(true);
  }, [handleFieldTouch]);

  const handleStartTimePress = useCallback(() => {
    handleFieldTouch('startTime');
    setShowStartTimePicker(true);
  }, [handleFieldTouch]);

  const handleEndTimePress = useCallback(() => {
    handleFieldTouch('endTime');
    setShowEndTimePicker(true);
  }, [handleFieldTouch]);

  // Vérification si la date est aujourd'hui
  const isToday = useMemo(() => {
    const today = new Date();
    const eventDate = new Date(eventData.date);
    return (
      eventDate.getDate() === today.getDate() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getFullYear() === today.getFullYear()
    );
  }, [eventData.date]);

  // Vérification si c'est pour demain
  const isTomorrow = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const eventDate = new Date(eventData.date);
    return (
      eventDate.getDate() === tomorrow.getDate() &&
      eventDate.getMonth() === tomorrow.getMonth() &&
      eventDate.getFullYear() === tomorrow.getFullYear()
    );
  }, [eventData.date]);

  // Format de date amélioré
  const getEnhancedDateDisplay = useCallback((date: Date) => {
    if (isToday) return "Aujourd'hui";
    if (isTomorrow) return "Demain";
    return formatDate(date);
  }, [isToday, isTomorrow, formatDate]);

  // Durée de l'événement
  const eventDuration = useMemo(() => {
    if (!eventData.startTime || !eventData.endTime) return null;
    
    const diff = eventData.endTime.getTime() - eventData.startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h${minutes}min`;
  }, [eventData.startTime, eventData.endTime]);

  // Affichage par défaut pour l'heure
  const getTimeDisplay = useCallback((time: Date | null, defaultText: string) => {
    if (!time) return defaultText;
    return formatTime(time);
  }, [formatTime]);

  return (
    <Animated.View entering={FadeInDown.duration(500)} className="px-4 py-6 flex-1">
      {/* En-tête simple */}
      <View className="mb-8">
        <Text className="text-white text-2xl font-extrabold mb-2">
          Date et heure
        </Text>
        <Text className="text-gray-400 text-base">
          Étape 2/5 - Définissez le calendrier de votre événement
        </Text>
      </View>

      <View className="space-y-8">
        {/* Section Date */}
        <View>
          <Text className="text-teal-400 text-lg font-medium mb-4">
            Date de l'événement
          </Text>
          
          <TouchableOpacity
            className={`bg-white/10 p-5 rounded-2xl flex-row justify-between items-center border-2 ${
              touchedFields.date && !isDateValid 
                ? 'border-orange-400/50' 
                : isDateValid 
                ? 'border-green-400/30' 
                : 'border-white/10'
            }`}
            onPress={handleDatePress}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center flex-1">
              <MaterialCommunityIcons 
                name="calendar" 
                size={24} 
                color={isDateValid ? "#68f2f4" : "#9ca3af"} 
                style={{ marginRight: 12 }}
              />
              <View>
                <Text className="text-white text-lg font-medium">
                  {getEnhancedDateDisplay(eventData.date)}
                </Text>
                {isToday && (
                  <Text className="text-teal-400 text-sm mt-1">🎉 Événement aujourd'hui</Text>
                )}
                {isTomorrow && (
                  <Text className="text-blue-400 text-sm mt-1">📌 Événement demain</Text>
                )}
                {!isToday && !isTomorrow && isDateValid && (
                  <Text className="text-gray-400 text-sm mt-1">Date sélectionnée</Text>
                )}
              </View>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDateValid ? "#68f2f4" : "#9ca3af"} 
            />
          </TouchableOpacity>

          {touchedFields.date && !isDateValid && (
            <View className="flex-row items-center mt-3 bg-orange-500/10 p-3 rounded-xl">
              <Ionicons name="warning" size={16} color="#f97316" />
              <Text className="text-orange-400 text-sm ml-2 flex-1">
                La date doit être dans le futur
              </Text>
            </View>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={eventData.date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
              accentColor="#68f2f4"
              themeVariant="dark"
            />
          )}
        </View>

        {/* Section Horaires */}
        <View>
          <Text className="text-teal-400 text-lg font-medium mb-4">
            Horaires de l'événement
          </Text>

          <View className="space-y-4">
            {/* Heure de début */}
            <View>
              <Text className="text-white font-medium mb-2">Heure de début</Text>
              <TouchableOpacity
                className={`bg-white/10 p-4 rounded-2xl flex-row justify-between items-center border-2 ${
                  touchedFields.startTime && !isStartTimeValid 
                    ? 'border-orange-400/50' 
                    : isStartTimeValid 
                    ? 'border-green-400/30' 
                    : 'border-white/10'
                }`}
                onPress={handleStartTimePress}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <MaterialCommunityIcons 
                    name="clock-outline" 
                    size={22} 
                    color={isStartTimeValid ? "#68f2f4" : "#9ca3af"} 
                    style={{ marginRight: 12 }}
                  />
                  <Text className="text-white text-lg">
                    {getTimeDisplay(eventData.startTime, "Sélectionner l'heure de début")}
                  </Text>
                </View>
                <Ionicons 
                  name="time-outline" 
                  size={20} 
                  color={isStartTimeValid ? "#68f2f4" : "#9ca3af"} 
                />
              </TouchableOpacity>

              {showStartTimePicker && (
                <DateTimePicker
                  value={eventData.startTime || new Date()}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleStartTimeChange}
                  accentColor="#68f2f4"
                  themeVariant="dark"
                />
              )}
            </View>

            {/* Heure de fin */}
            <View>
              <Text className="text-white font-medium mb-2">Heure de fin</Text>
              <TouchableOpacity
                className={`bg-white/10 p-4 rounded-2xl flex-row justify-between items-center border-2 ${
                  touchedFields.endTime && !isEndTimeValid 
                    ? 'border-orange-400/50' 
                    : isEndTimeValid 
                    ? 'border-green-400/30' 
                    : 'border-white/10'
                }`}
                onPress={handleEndTimePress}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <MaterialCommunityIcons 
                    name="clock-check-outline" 
                    size={22} 
                    color={isEndTimeValid ? "#68f2f4" : "#9ca3af"} 
                    style={{ marginRight: 12 }}
                  />
                  <Text className="text-white text-lg">
                    {getTimeDisplay(eventData.endTime, "Sélectionner l'heure de fin")}
                  </Text>
                </View>
                <Ionicons 
                  name="time-outline" 
                  size={20} 
                  color={isEndTimeValid ? "#68f2f4" : "#9ca3af"} 
                />
              </TouchableOpacity>

              {showEndTimePicker && (
                <DateTimePicker
                  value={eventData.endTime || new Date()}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleEndTimeChange}
                  minimumDate={eventData.startTime || new Date()}
                  accentColor="#68f2f4"
                  themeVariant="dark"
                />
              )}
            </View>
          </View>

          {/* Messages de validation */}
          {(touchedFields.startTime || touchedFields.endTime) && !isEndTimeValid && eventData.startTime && eventData.endTime && (
            <View className="flex-row items-center mt-4 bg-orange-500/10 p-3 rounded-xl">
              <Ionicons name="alert-circle" size={16} color="#f97316" />
              <Text className="text-orange-400 text-sm ml-2 flex-1">
                L'heure de fin doit être après l'heure de début
              </Text>
            </View>
          )}

          {/* Affichage de la durée */}
          {eventDuration && isEndTimeValid && (
            <Animated.View 
              entering={FadeInDown.duration(300)}
              className="mt-4 bg-teal-500/10 p-3 rounded-xl border border-teal-400/30"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-teal-400 font-medium">Durée de l'événement</Text>
                  <Text className="text-white text-sm mt-1">{eventDuration}</Text>
                </View>
                <MaterialCommunityIcons 
                  name="timer-sand" 
                  size={20} 
                  color="#68f2f4" 
                />
              </View>
            </Animated.View>
          )}
        </View>

        {/* Résumé final quand tout est valide */}
        {(isDateValid && isStartTimeValid && isEndTimeValid) && (
          <Animated.View 
            entering={FadeInDown.duration(400)}
            className="bg-green-500/10 p-4 rounded-xl border border-green-400/30"
          >
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={24} color="#10b981" style={{ marginRight: 12, marginTop: 2 }} />
              <View className="flex-1">
                <Text className="text-green-400 font-medium text-base mb-1">
                  Calendrier configuré avec succès
                </Text>
                <Text className="text-white text-sm">
                  Votre événement aura lieu le {getEnhancedDateDisplay(eventData.date)} de {formatTime(eventData.startTime!)} à {formatTime(eventData.endTime!)} ({eventDuration})
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
});

Step2.displayName = "Step2";
export default Step2;