import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput } from '@/src/components/FormInput';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Colors } from '@/src/constants/colors';
import { publishNews } from '@/src/api/newsApi';

const schema = z.object({
  title: z.string().min(3, 'Headline must be at least 3 characters'),
  body: z.string().min(10, 'Story must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

export default function PublishNewsScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      await publishNews({ ...data, imageUri: imageUri ?? undefined });
      Alert.alert('Published!', 'Your news has been shared with the community.', [
        {
          text: 'OK',
          onPress: () => {
            reset();
            setImageUri(null);
            router.back();
          },
        },
      ]);
    } catch (err: any) {
      const message = err?.response?.data?.message ?? 'Failed to publish. Please try again.';
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
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Headline"
                placeholder="Enter a clear, concise headline"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.title?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="body"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.bodyContainer}>
                <Text style={styles.label}>Story</Text>
                <View style={[styles.bodyInputWrap, errors.body && styles.bodyInputError]}>
                  <FormInput
                    label=""
                    placeholder="Write the full news story here..."
                    multiline
                    numberOfLines={6}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    style={styles.bodyInput}
                    error={undefined}
                  />
                </View>
                {errors.body && (
                  <Text style={styles.errorText}>{errors.body.message}</Text>
                )}
              </View>
            )}
          />

          {/* Image picker */}
          <View style={styles.imageSection}>
            <Text style={styles.label}>Photo (optional)</Text>
            {imageUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImageUri(null)}
                >
                  <Text style={styles.removeImageText}>✕ Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.7}>
                <Text style={styles.imagePickerIcon}>📷</Text>
                <Text style={styles.imagePickerLabel}>Tap to add a photo</Text>
                <Text style={styles.imagePickerHint}>16:9 ratio recommended</Text>
              </TouchableOpacity>
            )}
          </View>

          <PrimaryButton
            label="Publish News"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={styles.publishButton}
          />
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  bodyContainer: {
    marginBottom: 16,
  },
  bodyInputWrap: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingTop: 4,
    minHeight: 140,
  },
  bodyInputError: {
    borderColor: Colors.error,
  },
  bodyInput: {
    height: 130,
    textAlignVertical: 'top',
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.error,
  },
  imageSection: {
    marginBottom: 24,
  },
  imagePicker: {
    height: 140,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  imagePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  imagePickerHint: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  previewContainer: {
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 14,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  removeImageText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  publishButton: {
    marginTop: 8,
  },
});
