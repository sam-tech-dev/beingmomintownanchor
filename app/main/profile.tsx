import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput } from '@/src/components/FormInput';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { TownPicker } from '@/src/components/TownPicker';
import { Colors } from '@/src/constants/colors';
import { useAuth } from '@/src/context/AuthContext';
import { updateProfile } from '@/src/api/townanchorApi';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  townId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTownName, setSelectedTownName] = useState(user?.town?.name ?? '');

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      townId: user?.town?._id ?? '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const payload: { name?: string; townId?: string } = {};
      if (data.name !== user?.name) payload.name = data.name;
      if (data.townId && data.townId !== user?.town?._id) payload.townId = data.townId;

      if (Object.keys(payload).length === 0) {
        router.back();
        return;
      }

      const res = await updateProfile(payload);
      await updateUser(res.data.user);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Something went wrong. Please try again.';
      Alert.alert('Update Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Edit Profile</Text>
            <Text style={styles.subtitle}>Update your name or select your town</Text>
          </View>

          <View style={styles.card}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Full Name"
                  placeholder="Your full name"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="townId"
              render={({ field: { value } }) => (
                <TownPicker
                  label="Your Town"
                  selectedTownId={value ?? ''}
                  selectedTownName={selectedTownName}
                  onChange={(id, name) => {
                    setValue('townId', id, { shouldValidate: true });
                    setSelectedTownName(name);
                  }}
                />
              )}
            />

            <PrimaryButton
              label="Save Changes"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  submitButton: {
    marginTop: 8,
  },
});
