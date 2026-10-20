import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useSettingsStore } from '@/stores/useSettingsStore';

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { updateSetting } = useSettingsStore();

  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  const handleFinish = async () => {
    await updateSetting('user_avatar', selectedAvatar);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className="flex-1 justify-between p-6"
    >
      <View className="h-4" />

      <View className="items-center">
        <Text
          style={{ color: colors.textPrimary }}
          className="text-2xl font-black tracking-tight mb-2 text-center"
        >
          Choose Your Avatar
        </Text>
        <Text
          style={{ color: colors.textSecondary }}
          className="text-xs text-center max-w-[260px] mb-8"
        >
          Personalize your TaskPRO space with a profile portrait.
        </Text>

        {/* Selected avatar preview */}
        <View className="relative mb-8">
          <Image
            source={{ uri: selectedAvatar }}
            className="w-28 h-28 rounded-full border-4 border-indigo-500 shadow-md"
          />
        </View>

        {/* Avatar Choices Grid */}
        <View className="flex-row gap-4">
          {AVATARS.map((url, i) => {
            const isSelected = selectedAvatar === url;
            return (
              <Pressable
                key={i}
                onPress={() => setSelectedAvatar(url)}
                className="relative active:scale-95"
              >
                <Image
                  source={{ uri: url }}
                  className="w-14 h-14 rounded-full"
                  style={{
                    borderColor: isSelected ? colors.primary : 'transparent',
                    borderWidth: isSelected ? 3 : 0,
                  }}
                />
                {isSelected && (
                  <View
                    style={{ backgroundColor: colors.primary }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
                  >
                    <Check size={11} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="pb-4">
        <Pressable
          onPress={handleFinish}
          style={{ backgroundColor: colors.primary }}
          className="w-full py-4 rounded-2xl items-center justify-center shadow-lg active:opacity-90"
        >
          <Text className="text-white text-base font-bold">
            Enter Workspace
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
