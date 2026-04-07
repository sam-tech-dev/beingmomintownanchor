import React, { useState } from 'react';
import {
  View,
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
import { Colors } from '@/src/constants/colors';
import { addTown } from '@/src/api/townApi';

const schema = z.object({
  name: z.string().min(2, 'Town name must be at least 2 characters'),
  post: z.string().optional(),
  block: z.string().optional(),
  district: z.string().min(2, 'District is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z
    .string()
    .min(1, 'Pincode is required')
    .regex(/^\d{5,10}$/, 'Enter a valid pincode'),
});

type FormData = z.infer<typeof schema>;

export default function AddTownScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      await addTown(data);
      Alert.alert('Town Added', `"${data.name}" has been successfully added to the platform.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to add town. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Town Name *"
                placeholder="e.g. Greenfield"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="post"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Post"
                placeholder="Postal area (optional)"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.post?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="block"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Block"
                placeholder="Block / Tehsil (optional)"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.block?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="district"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="District *"
                placeholder="e.g. Springfield District"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.district?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="state"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="State *"
                placeholder="e.g. California"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.state?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="pincode"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Pincode *"
                placeholder="e.g. 110001"
                keyboardType="number-pad"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.pincode?.message}
              />
            )}
          />

          <View style={styles.buttonRow}>
            <PrimaryButton
              label="Add Town"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
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
    padding: 24,
    paddingBottom: 40,
  },
  buttonRow: {
    marginTop: 8,
  },
});
