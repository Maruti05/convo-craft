import { Text, View } from '@/components/Themed';
import { Screen } from '@/components/layout/Screen';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuthContext } from '@/providers/AuthProvider';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

type Profile = {
  id: string;
  username: string;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  occupation?: string | null;
  languages_known?: string[] | null;
  followers?: string[] | null;
  following?: string[] | null;
  is_online?: boolean | null;
  last_seen?: string | null;
  status?: string | null;
  device_type?: string | null;
  push_token?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function ProfileScreen() {
  const supabase = getSupabaseClient();
  const { user } = useAuthContext();
   const { signOut, loading:profileLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const router = useRouter();
  async function loadProfile() {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (error) console.warn('loadProfile error', error.message);
    setProfile(data ?? null);
    setLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: editing ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [editing]);

  const followerCount = useMemo(() => profile?.followers?.length ?? 0, [profile]);
  const followingCount = useMemo(() => profile?.following?.length ?? 0, [profile]);

  const [form, setForm] = useState<Partial<Profile>>({});
  useEffect(() => {
    if (profile) setForm({ ...profile });
  }, [profile]);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update(form).eq('id', user.id);
    if (error) {
      console.warn('saveProfile error', error.message);
    } else {
      await loadProfile();
      setEditing(false);
      showSuccessToast();
    }
    setSaving(false);
  }

  function showSuccessToast() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  function setField<K extends keyof Profile>(key: K, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  if (loading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </Screen>
    );
  }

  if (!profile) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <Ionicons name="person-circle-outline" size={64} color="#CBD5E1" />
          <Text style={styles.emptyText}>No profile found</Text>
          <Text style={styles.emptySubtext}>Please try again later</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen >
      <ScrollView 
        contentContainerStyle={styles.container} 
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero Header with Gradient Background */}
        <LinearGradient
          colors={['#6366F1', '#8B5CF6', '#EC4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroOverlay}>
            {/* Action Buttons */}
            <View style={styles.headerActions}>
              <Pressable style={styles.iconButton} onPress={() => router.push('/(tabs)/settings')}>
                <Ionicons name="settings-outline" size={22} color="#fff" />
              </Pressable>
              <Pressable style={styles.iconButton} onPress={signOut}>
                <Ionicons name="share-outline" size={22} color="#fff" />
              </Pressable>
            </View>

            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={
                    profile.avatar_url
                      ? { uri: profile.avatar_url }
                      : require('@/assets/images/avatar-placeholder.jpg')
                  }
                  resizeMode="cover"
                  style={styles.avatar}
                />
                <Pressable style={styles.avatarEditButton}>
                  <Feather name="camera" size={16} color="#fff" />
                </Pressable>
                {profile.is_online && (
                  <View style={styles.onlineBadge}>
                    <View style={styles.onlinePulse} />
                  </View>
                )}
              </View>

              <Text style={styles.heroUsername}>{profile.username}</Text>
              <Text style={styles.heroFullName}>{profile.full_name || 'Add your name'}</Text>
              {profile.status && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>✨ {profile.status}</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <StatsCard 
              icon="people" 
              count={followerCount} 
              label="Followers" 
              color="#6366F1" 
            />
            <StatsCard 
              icon="person-add" 
              count={followingCount} 
              label="Following" 
              color="#8B5CF6" 
            />
            <StatsCard 
              icon="heart" 
              count={128} 
              label="Likes" 
              color="#EC4899" 
            />
          </View>

          {/* Edit Toggle Button */}
          <Pressable
            style={[styles.editToggleButton, editing && styles.editToggleButtonActive]}
            onPress={() => setEditing(!editing)}
          >
            <Ionicons
              name={editing ? 'close-circle' : 'create'}
              size={20}
              color={editing ? '#fff' : '#6366F1'}
            />
            <Text style={[styles.editToggleText, editing && styles.editToggleTextActive]}>
              {editing ? 'Cancel Editing' : 'Edit Profile'}
            </Text>
          </Pressable>

          {/* Profile Content */}
          {!editing ? (
            <View style={styles.viewMode}>
              {/* Bio Section */}
              {profile.bio && (
                <View style={styles.bioCard}>
                  <Text style={styles.bioText}>{profile.bio}</Text>
                </View>
              )}

              {/* Info Grid */}
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle" size={20} color="#6366F1" />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              <View style={styles.infoGrid}>
                <InfoGridItem icon="male-female" label="Gender" value={profile.gender} />
                <InfoGridItem icon="calendar" label="Birthday" value={profile.date_of_birth} />
                <InfoGridItem icon="earth" label="Nationality" value={profile.nationality} />
                <InfoGridItem icon="briefcase" label="Occupation" value={profile.occupation} />
              </View>

              {/* Languages */}
              {profile.languages_known && profile.languages_known.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="language" size={20} color="#8B5CF6" />
                    <Text style={styles.sectionTitle}>Languages</Text>
                  </View>
                  <View style={styles.tagsContainer}>
                    {profile.languages_known.map((lang, idx) => (
                      <View key={idx} style={styles.tag}>
                        <Text style={styles.tagText}>{lang}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Contact Info */}
              <View style={styles.sectionHeader}>
                <Ionicons name="mail" size={20} color="#EC4899" />
                <Text style={styles.sectionTitle}>Contact & Activity</Text>
              </View>
              <ContactCard
                items={[
                  { icon: 'mail', label: 'Email', value: profile.email },
                  { icon: 'phone-portrait', label: 'Device', value: profile.device_type },
                  { 
                    icon: 'time', 
                    label: 'Last Seen', 
                    value: profile.is_online ? 'Online now' : profile.last_seen 
                  },
                ]}
              />
            </View>
          ) : (
            <Animated.View style={[styles.editMode, { opacity: fadeAnim }]}>
              <EditField
                icon="person"
                label="Full Name"
                value={form.full_name ?? ''}
                onChangeText={(t: string) => setField('full_name', t)}
                placeholder="Enter your full name"
              />
              
              <EditField
                icon="create"
                label="Bio"
                value={form.bio ?? ''}
                onChangeText={(t: string) => setField('bio', t)}
                placeholder="Tell us about yourself..."
                multiline
                maxLength={200}
              />

              <View style={styles.editRow}>
                <View style={styles.editHalf}>
                  <EditField
                    icon="male-female"
                    label="Gender"
                    value={form.gender ?? ''}
                    onChangeText={(t: string) => setField('gender', t)}
                    placeholder="Gender"
                  />
                </View>
                <View style={styles.editHalf}>
                  <EditField
                    icon="calendar"
                    label="Birthday"
                    value={form.date_of_birth ?? ''}
                    onChangeText={(t: string) => setField('date_of_birth', t)}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              <View style={styles.editRow}>
                <View style={styles.editHalf}>
                  <EditField
                    icon="earth"
                    label="Nationality"
                    value={form.nationality ?? ''}
                    onChangeText={(t: string) => setField('nationality', t)}
                    placeholder="Country"
                  />
                </View>
                <View style={styles.editHalf}>
                  <EditField
                    icon="briefcase"
                    label="Occupation"
                    value={form.occupation ?? ''}
                    onChangeText={(t: string) => setField('occupation', t)}
                    placeholder="Job title"
                  />
                </View>
              </View>

              <EditField
                icon="language"
                label="Languages (comma-separated)"
                value={(form.languages_known ?? []).join(', ')}
                onChangeText={(t: string) =>
                  setField(
                    'languages_known',
                    t.split(',').map((s: string) => s.trim()).filter(Boolean)
                  )
                }
                placeholder="e.g., English, Spanish, French"
              />

              {/* Save Button */}
              <Pressable
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                disabled={saving}
                onPress={saveProfile}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveGradient}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={22} color="#fff" />
                      <Text style={styles.saveText}>Save Changes</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          )}
        </View>

        {/* Toast Notification */}
        {showToast && (
          <Animated.View style={styles.toast}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.toastText}>Profile updated successfully!</Text>
          </Animated.View>
        )}
      </ScrollView>
    </Screen>
  );
}

// ---------- Reusable Components ----------

function StatsCard({ icon, count, label, color }: { 
  icon: any; 
  count: number; 
  label: string; 
  color: string;
}) {
  return (
    <View style={styles.statsCard}>
      <View style={[styles.statsIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statsCount}>{count}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  );
}

function InfoGridItem({ icon, label, value }: { 
  icon: any; 
  label: string; 
  value?: string | null;
}) {
  return (
    <View style={styles.gridItem}>
      <View style={styles.gridIconContainer}>
        <Ionicons name={icon} size={18} color="#6366F1" />
      </View>
      <Text style={styles.gridLabel}>{label}</Text>
      <Text style={styles.gridValue}>{value || 'Not set'}</Text>
    </View>
  );
}

function ContactCard({ items }: { 
  items: { icon: string; label: string; value?: string | null }[] 
}) {
  return (
    <View style={styles.contactCard}>
      {items.map((item, idx) => (
        <View key={idx} style={styles.contactRow}>
          <View style={styles.contactLeft}>
            <View style={styles.contactIcon}>
              <Ionicons name={item.icon as any} size={16} color="#64748B" />
            </View>
            <Text style={styles.contactLabel}>{item.label}</Text>
          </View>
          <Text style={styles.contactValue}>{item.value || '—'}</Text>
        </View>
      ))}
    </View>
  );
}

function EditField({ 
  icon, 
  label, 
  multiline, 
  maxLength,
  placeholder,
  ...props 
}: any) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View style={styles.editField}>
      <View style={styles.editFieldHeader}>
        <View style={styles.editFieldLabel}>
          <Ionicons name={icon} size={16} color="#6366F1" />
          <Text style={styles.editLabel}>{label}</Text>
        </View>
        {maxLength && props.value && (
          <Text style={styles.charCount}>
            {props.value.length}/{maxLength}
          </Text>
        )}
      </View>
      <TextInput
        {...props}
        multiline={multiline}
        maxLength={maxLength}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        style={[
          styles.editInput,
          multiline && styles.editInputMultiline,
          isFocused && styles.editInputFocused,
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#94A3B8',
  },

  // Hero Section
  heroGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 100,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroOverlay: {
    backgroundColor: 'transparent',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    gap: 12,
    backgroundColor: 'transparent',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'transparent',
    borderRadius: 60,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 60,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#E2E8F0',
  },
  avatarEditButton: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  onlineBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlinePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  heroUsername: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroFullName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  statusBadge: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Content Container
  contentContainer: {
    marginTop: -70,
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statsCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // Edit Toggle Button
  editToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 24,
    gap: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  editToggleButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  editToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  editToggleTextActive: {
    color: '#fff',
  },

  // View Mode
  viewMode: {
    backgroundColor: 'transparent',
  },
  bioCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
    fontWeight: '400',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gridIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '600',
  },

  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
    backgroundColor: 'transparent',
  },
  tag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  tagText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },

  // Contact Card
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  contactValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    marginLeft: 12,
  },

  // Edit Mode
  editMode: {
    backgroundColor: 'transparent',
  },
  editField: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  editFieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  editFieldLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'transparent',
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  charCount: {
    fontSize: 12,
    color: '#94A3B8',
  },
  editInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E293B',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    fontWeight: '500',
  },
  editInputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  editInputFocused: {
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  editRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'transparent',
  },
  editHalf: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // Save Button
  saveButton: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  toastText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
});