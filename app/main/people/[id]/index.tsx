import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Image, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { PersonPicker } from '@/src/components/PersonPicker';
import { TownPicker } from '@/src/components/TownPicker';
import { Colors } from '@/src/constants/colors';
import { useAuth } from '@/src/context/AuthContext';
import { getOnePerson, updatePerson, type Person, type PersonSummary } from '@/src/api/personApi';

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

const formatDobForInput = (isoDate: string | null) => {
  if (!isoDate) return '';
  return isoDate.split('T')[0]; // YYYY-MM-DD
};

export default function EditPersonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<Person | null>(null);

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

  useEffect(() => {
    (async () => {
      try {
        const res = await getOnePerson(id);
        const p = res.data.person;
        setPerson(p);
        setName(p.name);
        setGender(p.gender);
        setDob(formatDobForInput(p.dateOfBirth));
        setMobile(p.mobileNumber ?? '');
        setMaritalStatus(p.maritalStatus);
        setProfession(p.profession ?? '');
        setEducation((p.highestEducation ?? '') as Education);
        setIsAlive(p.isAlive);
        setTownId(p.town._id);
        setTownName(p.town.name);
        if (p.fatherId) { setFatherId(p.fatherId._id); setFatherName(p.fatherId.name); }
        if (p.motherId) { setMotherId(p.motherId._id); setMotherName(p.motherId.name); }
        setLifePartners(p.lifePartnerIds ?? []);
      } catch {
        Alert.alert('Error', 'Failed to load person details.');
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please allow access to your photo library.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
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
      formData.append('mobileNumber', mobile.trim());
      formData.append('dateOfBirth', dob.trim());
      formData.append('profession', profession.trim());
      formData.append('highestEducation', education);
      if (user?.isAdmin && townId) formData.append('townId', townId);
      formData.append('fatherId', fatherId);
      formData.append('motherId', motherId);
      lifePartners.forEach((p) => formData.append('lifePartnerIds', p._id));
      if (photoUri) {
        const filename = photoUri.split('/').pop() ?? 'photo.jpg';
        const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
        formData.append('profilePhoto', { uri: photoUri, name: filename, type: ext === 'png' ? 'image/png' : 'image/jpeg' } as unknown as Blob);
      }
      await updatePerson(id, formData);
      Alert.alert('Saved', 'Person updated successfully.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message ?? 'Failed to update person.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLifePartner = (pid: string, pName: string) => {
    if (!pid || lifePartners.some((p) => p._id === pid)) return;
    setLifePartners((prev) => [...prev, { _id: pid, name: pName, profilePhoto: null, town: { _id: '', name: '' }, dateOfBirth: null, gender: '', isAlive: true }]);
  };

  const removeLifePartner = (pid: string) => setLifePartners((prev) => prev.filter((p) => p._id !== pid));

  const currentPhoto = photoUri ?? person?.profilePhoto ?? null;
  const initials = name.trim() ? name.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '?';

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

      {/* Profile Photo */}
      <View style={styles.photoSection}>
        <TouchableOpacity onPress={pickPhoto} activeOpacity={0.8}>
          {currentPhoto
            ? <Image source={{ uri: currentPhoto }} style={styles.avatar} />
            : <View style={styles.avatarPlaceholder}><Text style={styles.avatarInitials}>{initials}</Text></View>}
          <View style={styles.cameraBadge}><Text style={styles.cameraIcon}>📷</Text></View>
        </TouchableOpacity>
        <Text style={styles.photoHint}>Tap to change photo</Text>
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
          <TownPicker label="Town" selectedTownId={townId} selectedTownName={townName} onChange={(tid, tn) => { setTownId(tid); setTownName(tn); }} />
        )}
      </View>

      {/* Section 3: Family Relations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Family Relations</Text>

        <PersonPicker label="Father" selectedPersonId={fatherId} selectedPersonName={fatherName} onChange={(pid, pn) => { setFatherId(pid); setFatherName(pn); }} placeholder="Search to link father" />
        <PersonPicker label="Mother" selectedPersonId={motherId} selectedPersonName={motherName} onChange={(pid, pn) => { setMotherId(pid); setMotherName(pn); }} placeholder="Search to link mother" />

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
          onChange={(pid, pn) => addLifePartner(pid, pn)}
          placeholder="+ Add life partner"
        />
      </View>

      {/* Submit */}
      <TouchableOpacity style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={isSubmitting} activeOpacity={0.8}>
        {isSubmitting ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.submitText}>Save Changes</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 48 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: Colors.primary },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 30, fontWeight: '800', color: Colors.white },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.white },
  cameraIcon: { fontSize: 13 },
  photoHint: { marginTop: 8, fontSize: 12, color: Colors.textMuted },
  section: { backgroundColor: Colors.surface, borderRadius: 16, padding: 18, marginBottom: 16, shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 16 },
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
