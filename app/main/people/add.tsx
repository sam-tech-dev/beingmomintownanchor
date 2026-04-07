import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { PersonPicker } from '@/src/components/PersonPicker';
import { TownPicker } from '@/src/components/TownPicker';
import { Colors } from '@/src/constants/colors';
import { useAuth } from '@/src/context/AuthContext';
import { addPerson, type PersonSummary } from '@/src/api/personApi';

type Gender = 'male' | 'female' | 'other';
type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
type Education = 'graduate' | 'postgraduate' | '';

function SegmentedSelector<T extends string>({ options, value, onChange }: { options: { label: string; value: T }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={seg.row}>
      {options.map((opt) => (
        <TouchableOpacity key={opt.value} style={[seg.btn, value === opt.value && seg.btnActive]} onPress={() => onChange(opt.value)} activeOpacity={0.7}>
          <Text style={[seg.text, value === opt.value && seg.textActive]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const seg = StyleSheet.create({
  row: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: 16 },
  btn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: Colors.surface },
  btnActive: { backgroundColor: Colors.primary },
  text: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  textActive: { color: Colors.white },
});

export default function AddPersonScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [dob, setDob] = useState('');
  const [mobile, setMobile] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('single');
  const [profession, setProfession] = useState('');
  const [education, setEducation] = useState<Education>('');
  const [isAlive, setIsAlive] = useState(true);
  const [townId, setTownId] = useState('');
  const [townName, setTownName] = useState('');
  const [fatherId, setFatherId] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherId, setMotherId] = useState('');
  const [motherName, setMotherName] = useState('');
  const [lifePartners, setLifePartners] = useState<PersonSummary[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow access to your photo library.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (user?.isAdmin && !townId) errs.townId = 'Please select a town';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('gender', gender);
      formData.append('maritalStatus', maritalStatus);
      formData.append('isAlive', String(isAlive));
      if (mobile.trim()) formData.append('mobileNumber', mobile.trim());
      if (dob.trim()) formData.append('dateOfBirth', dob.trim());
      if (profession.trim()) formData.append('profession', profession.trim());
      if (education) formData.append('highestEducation', education);
      if (user?.isAdmin && townId) formData.append('townId', townId);
      if (fatherId) formData.append('fatherId', fatherId);
      if (motherId) formData.append('motherId', motherId);
      lifePartners.forEach((p) => formData.append('lifePartnerIds', p._id));
      if (photoUri) {
        const filename = photoUri.split('/').pop() ?? 'photo.jpg';
        const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
        formData.append('profilePhoto', { uri: photoUri, name: filename, type: ext === 'png' ? 'image/png' : 'image/jpeg' } as unknown as Blob);
      }
      await addPerson(formData);
      Alert.alert('Success', 'Person added successfully.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to add person.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLifePartner = (id: string, pName: string) => {
    if (!id || lifePartners.some((p) => p._id === id)) return;
    setLifePartners((prev) => [...prev, { _id: id, name: pName, profilePhoto: null, town: { _id: '', name: '' }, dateOfBirth: null, gender: '', isAlive: true }]);
  };

  const removeLifePartner = (id: string) => setLifePartners((prev) => prev.filter((p) => p._id !== id));

  const initials = name.trim() ? name.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '?';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

      {/* Profile Photo */}
      <View style={styles.photoSection}>
        <TouchableOpacity onPress={pickPhoto} activeOpacity={0.8}>
          {photoUri
            ? <Image source={{ uri: photoUri }} style={styles.avatar} />
            : <View style={styles.avatarPlaceholder}><Text style={styles.avatarInitials}>{initials}</Text></View>}
          <View style={styles.cameraBadge}><Text style={styles.cameraIcon}>📷</Text></View>
        </TouchableOpacity>
        <Text style={styles.photoHint}>Tap to add photo</Text>
      </View>

      {/* Section 1: Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Info</Text>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput style={[styles.input, errors.name && styles.inputError]} placeholder="Enter full name" placeholderTextColor={Colors.textMuted} value={name} onChangeText={setName} />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <Text style={styles.label}>Gender *</Text>
        <SegmentedSelector<Gender>
          options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Other', value: 'other' }]}
          value={gender} onChange={setGender}
        />

        <Text style={styles.label}>Date of Birth (optional)</Text>
        <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textMuted} value={dob} onChangeText={setDob} keyboardType="numbers-and-punctuation" />

        <Text style={styles.label}>Mobile Number (optional)</Text>
        <TextInput style={styles.input} placeholder="+1234567890" placeholderTextColor={Colors.textMuted} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
      </View>

      {/* Section 2: Background */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Background</Text>

        <Text style={styles.label}>Marital Status *</Text>
        <SegmentedSelector<MaritalStatus>
          options={[{ label: 'Single', value: 'single' }, { label: 'Married', value: 'married' }, { label: 'Divorced', value: 'divorced' }, { label: 'Widowed', value: 'widowed' }]}
          value={maritalStatus} onChange={setMaritalStatus}
        />

        <Text style={styles.label}>Profession (optional)</Text>
        <TextInput style={styles.input} placeholder="e.g. Farmer, Teacher, Doctor" placeholderTextColor={Colors.textMuted} value={profession} onChangeText={setProfession} />

        <Text style={styles.label}>Highest Education (optional)</Text>
        <SegmentedSelector<Education>
          options={[{ label: 'None', value: '' }, { label: 'Graduate', value: 'graduate' }, { label: 'Post-Grad', value: 'postgraduate' }]}
          value={education} onChange={setEducation}
        />

        <View style={styles.switchRow}>
          <View style={styles.switchLabel}>
            <Text style={styles.label}>Is Alive</Text>
            <Text style={styles.switchHint}>Toggle off if the person is deceased</Text>
          </View>
          <Switch value={isAlive} onValueChange={setIsAlive} trackColor={{ true: Colors.primary, false: Colors.border }} thumbColor={Colors.white} />
        </View>

        {user?.isAdmin && (
          <>
            <TownPicker label="Town *" selectedTownId={townId} selectedTownName={townName} onChange={(id, n) => { setTownId(id); setTownName(n); }} error={errors.townId} />
          </>
        )}
      </View>

      {/* Section 3: Family Relations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Family Relations</Text>
        <Text style={styles.sectionHint}>Optional — you can add or update these later.</Text>

        <PersonPicker label="Father" selectedPersonId={fatherId} selectedPersonName={fatherName} onChange={(id, n) => { setFatherId(id); setFatherName(n); }} placeholder="Search to link father" />
        <PersonPicker label="Mother" selectedPersonId={motherId} selectedPersonName={motherName} onChange={(id, n) => { setMotherId(id); setMotherName(n); }} placeholder="Search to link mother" />

        <Text style={styles.label}>Life Partners</Text>
        {lifePartners.map((p) => (
          <View key={p._id} style={styles.partnerRow}>
            <Text style={styles.partnerName}>{p.name}</Text>
            <TouchableOpacity onPress={() => removeLifePartner(p._id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.removeText}>✕ Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
        <PersonPicker
          label=""
          selectedPersonId=""
          selectedPersonName=""
          onChange={(id, n) => addLifePartner(id, n)}
          placeholder="+ Add life partner"
        />
      </View>

      {/* Submit */}
      <TouchableOpacity style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.8}>
        {isSubmitting ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitText}>Add Person</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 48 },
  photoSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: Colors.primary },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 30, fontWeight: '800', color: Colors.white },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.white },
  cameraIcon: { fontSize: 13 },
  photoHint: { marginTop: 8, fontSize: 12, color: Colors.textMuted },
  section: { backgroundColor: Colors.surface, borderRadius: 16, padding: 18, marginBottom: 16, shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 },
  sectionHint: { fontSize: 12, color: Colors.textMuted, marginTop: -10, marginBottom: 14, fontStyle: 'italic' },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6, letterSpacing: 0.2 },
  input: { height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface, paddingHorizontal: 14, fontSize: 15, color: Colors.textPrimary, marginBottom: 16 },
  inputError: { borderColor: Colors.error },
  errorText: { fontSize: 12, color: Colors.error, marginTop: -12, marginBottom: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  switchLabel: { flex: 1 },
  switchHint: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  partnerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.background, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  partnerName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  removeText: { fontSize: 12, color: Colors.error, fontWeight: '600' },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
});
