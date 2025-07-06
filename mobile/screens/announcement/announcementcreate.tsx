import React from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { usePostAnnouncement, usePostAnnouncementRecipient, usePostAnnouncementFiles } from './queries';
import { useRouter } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import AnnouncementSchema from '@/form-schema/announcement-schema';

export default function AnnouncementCreatePage() {
  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(AnnouncementSchema)
  });

  const { mutateAsync: postAnnouncement } = usePostAnnouncement();
  const { mutateAsync: postRecipient } = usePostAnnouncementRecipient();
  const { mutateAsync: postFiles } = usePostAnnouncementFiles();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      const announcement = await postAnnouncement(data);

      await postRecipient({ recipients: [{ ann: announcement.ann_id, ar_mode: data.ar_mode[0], ar_age: data.ar_age ? data.ar_age[0] : 'all' }] });

      await postFiles([
        { ann: announcement.ann_id, af_name: 'Sample Image', af_url: 'https://via.placeholder.com/150', af_type: 'image' },
      ]);

      reset();
      router.back();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Create Announcement</Text>

      <Text style={{ marginBottom: 4 }}>Title</Text>
      <Controller
        control={control}
        name="ann_title"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={{ borderWidth: 1, padding: 8, marginBottom: 16 }}
            onChangeText={onChange}
            value={value}
            placeholder="Enter title"
          />
        )}
      />

      <Text style={{ marginBottom: 4 }}>Details</Text>
      <Controller
        control={control}
        name="ann_details"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={{ borderWidth: 1, padding: 8, marginBottom: 16, height: 100 }}
            multiline
            onChangeText={onChange}
            value={value}
            placeholder="Enter details"
          />
        )}
      />

      <Text style={{ marginBottom: 4 }}>Type</Text>
      <Controller
        control={control}
        name="ann_type"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={{ borderWidth: 1, padding: 8, marginBottom: 16 }}
            onChangeText={onChange}
            value={value}
            placeholder="Enter type (general, urgent, event)"
          />
        )}
      />

      <Button title="Submit" onPress={handleSubmit(onSubmit)} />
    </ScrollView>
  );
}
