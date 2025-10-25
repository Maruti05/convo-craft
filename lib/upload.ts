import * as ImagePicker from 'expo-image-picker';
import { getSupabaseClient } from '@/lib/supabase';

export async function pickImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return null;
  }
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });
  if (res.canceled) return null;
  const uri = res.assets?.[0]?.uri;
  return uri ?? null;
}

export async function uploadImage(uri: string, roomId: string): Promise<string> {
  const supabase = getSupabaseClient();
  const resp = await fetch(uri);
  const blob = await resp.blob();
  const ext = (blob.type?.split('/')?.[1] ?? 'jpg').toLowerCase();
  const filePath = `${roomId}/${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage.from('chat-images').upload(filePath, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: false,
  });
  if (error) throw error;
  const { data: pubUrl } = supabase.storage.from('chat-images').getPublicUrl(data.path);
  return pubUrl.publicUrl;
}