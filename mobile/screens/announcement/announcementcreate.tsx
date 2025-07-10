import React from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Image,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Toast from 'react-native-toast-message';

import AnnouncementSchema from '@/form-schema/announcement-schema';
import {
  usePostAnnouncement,
  usePostAnnouncementRecipient,
  usePostAnnouncementFiles,
} from './queries';
import { useAuth } from '@/contexts/AuthContext';
import MediaPicker from '@/components/ui/media-picker';

type FormData = z.infer<typeof AnnouncementSchema>;

export default function AnnouncementCreatePage() {
  const { user } = useAuth();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues: {
      ann_title: '',
      ann_details: '',
      ann_type: 'general',
      ann_start_at: '',
      ann_end_at: '',
      ar_mode: [],
      positions: [],
      ar_age: [],
      staff: '',
    },
  });

  const { mutateAsync: postAnnouncement } = usePostAnnouncement();
  const { mutateAsync: postRecipient } = usePostAnnouncementRecipient();
  const { mutate: postFiles } = usePostAnnouncementFiles();
  const [selectedImage, setSelectedImage] = React.useState<Record<string, any>>({});

  const annType = watch('ann_type');
  React.useEffect(() => {
    if (annType === 'general') {
      setValue('ann_start_at', '');
      setValue('ann_end_at', '');
    }
  }, [annType]);

  const onSubmit = async (data: FormData) => {
    try {
      if (!user?.staff?.staff_id) {
  Toast.show({
    type: 'error',
    text1: 'Missing staff ID',
    text2: 'You must be logged in as a staff member to create an announcement.',
  });
  return;
}

const payload = {
  ...data,
  ann_start_at: data.ann_start_at || null,
  ann_end_at: data.ann_end_at || null,
  staff: user.staff.staff_id,
};

      const createdAnnouncement = await postAnnouncement(payload);
      Toast.show({ type: 'success', text1: 'Announcement created!' });

      if (data.positions.length > 0) {
        const recipients = data.positions.flatMap((pos) =>
          data.ar_mode.flatMap((mode) =>
            (data.ar_age.length ? data.ar_age : ['youth', 'adult', 'senior']).map((age) => ({
              ann: createdAnnouncement.ann_id,
              ar_mode: mode,
              ar_age: age,
              position: pos,
              staff: user?.staff?.staff_id || '',
            }))
          )
        );
        await postRecipient({ recipients });
        Toast.show({ type: 'success', text1: 'Recipients assigned' });
      }

      if (selectedImage?.path && selectedImage?.url) {
        const filePayload = [
          {
            af_name: selectedImage.name,
            af_type: selectedImage.type,
            af_path: selectedImage.path,
            af_url: selectedImage.url,
            ann: createdAnnouncement.ann_id,
            staff: user?.staff?.staff_id,
          },
        ];
        postFiles(filePayload);
        Toast.show({ type: 'success', text1: 'Files uploaded' });
      }
    } catch (err: any) {
      console.error('Submission error:', err?.response?.data || err);
      Toast.show({
        type: 'error',
        text1: 'Failed to create announcement',
        text2: JSON.stringify(err?.response?.data || 'Unknown error'),
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Create Announcement
      </Text>

      <Text>Title *</Text>
      <Controller
        control={control}
        name="ann_title"
        render={({ field }) => (
          <TextInput
            value={field.value}
            onChangeText={field.onChange}
            placeholder="Title"
            style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
          />
        )}
      />
      {errors.ann_title && <Text style={{ color: 'red' }}>{errors.ann_title.message}</Text>}

      <Text>Details *</Text>
      <Controller
        control={control}
        name="ann_details"
        render={({ field }) => (
          <TextInput
            value={field.value}
            onChangeText={field.onChange}
            multiline
            placeholder="Details"
            style={{ borderWidth: 1, padding: 8, height: 100, marginBottom: 8 }}
          />
        )}
      />
      {errors.ann_details && <Text style={{ color: 'red' }}>{errors.ann_details.message}</Text>}

      <Text>Type *</Text>
      <Controller
        control={control}
        name="ann_type"
        render={({ field }) => (
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {['general', 'urgent', 'event'].map((type) => (
              <Button
                key={type}
                title={field.value === type ? `✓ ${type}` : type}
                onPress={() => field.onChange(type)}
              />
            ))}
          </View>
        )}
      />

      {['urgent', 'event'].includes(annType) && (
        <>
          <Text>Start Date</Text>
          <Controller
            control={control}
            name="ann_start_at"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="YYYY-MM-DDTHH:mm"
                style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
              />
            )}
          />
          {errors.ann_start_at && <Text style={{ color: 'red' }}>{errors.ann_start_at.message}</Text>}

          <Text>End Date</Text>
          <Controller
            control={control}
            name="ann_end_at"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="YYYY-MM-DDTHH:mm"
                style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
              />
            )}
          />
          {errors.ann_end_at && <Text style={{ color: 'red' }}>{errors.ann_end_at.message}</Text>}
        </>
      )}

      <Text>Delivery Modes *</Text>
      <Controller
        control={control}
        name="ar_mode"
        render={({ field }) => (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
            {['sms', 'email', 'public'].map((mode) => (
              <Button
                key={mode}
                title={field.value.includes(mode) ? `✓ ${mode}` : mode}
                onPress={() =>
                  field.onChange(
                    field.value.includes(mode)
                      ? field.value.filter((m) => m !== mode)
                      : [...field.value, mode]
                  )
                }
              />
            ))}
          </View>
        )}
      />
      {errors.ar_mode && <Text style={{ color: 'red' }}>{errors.ar_mode.message}</Text>}

      <Text>Age Groups</Text>
      <Controller
        control={control}
        name="ar_age"
        render={({ field }) => (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
            {['youth', 'adult', 'senior'].map((age) => (
              <Button
                key={age}
                title={field.value.includes(age) ? `✓ ${age}` : age}
                onPress={() =>
                  field.onChange(
                    field.value.includes(age)
                      ? field.value.filter((a) => a !== age)
                      : [...field.value, age]
                  )
                }
              />
            ))}
          </View>
        )}
      />

      <Text style={{ marginTop: 16, marginBottom: 8 }}>Add Media</Text>
      <MediaPicker selectedImage={selectedImage} setSelectedImage={setSelectedImage} />

      <Button title="Create Announcement" onPress={handleSubmit(onSubmit)} />
    </ScrollView>
  );
}
