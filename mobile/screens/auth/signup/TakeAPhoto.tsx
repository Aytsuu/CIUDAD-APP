import React from 'react';
import Layout from './_layout';
import { useRegistrationFormContext } from '@/contexts/RegistrationFormContext';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';
import { FaceDetectionCam, FaceDetectionCamHandle } from './FaceDetectionCam';
import { supabase } from '@/lib/supabase';
import 'react-native-get-random-values';
import { v4 as uuid4 } from 'uuid';
import * as ImageManipulator from 'expo-image-manipulator';

export default function TakeAPhoto() {
  const router = useRouter();
  const { getValues } = useRegistrationFormContext();
  const [isValid, setIsValid] = React.useState<boolean>(false);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const cameraRef = React.useRef<FaceDetectionCamHandle>(null);

  const submit = async () => {  
    if (!cameraRef.current || isUploading) return;
    setIsUploading(true);

    try {
      const photo = await cameraRef.current.capturePhoto();

      // Convert path to proper URI format
      const photoUri = `file://${photo?.path}`;

      // Compress photo to reduce size
      const compressedImage = await ImageManipulator.manipulateAsync(
        photoUri,
        [{ resize: { width: 800, height: 1200 } }],
        {
          compress: 0.8, // 70% compression (0.7)
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!compressedImage.base64) {
        throw new Error('Compressed image base64 data is undefined');
      }

      const arrayBuffer = Uint8Array.from(atob(compressedImage.base64), c => c.charCodeAt(0));

      const fileName = `${uuid4()}.jpg`;
      const filePath = `uploads/${fileName}`;
      const { error } = await supabase.storage
        .from('image-bucket')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('image-bucket')
        .getPublicUrl(filePath);

      console.log('Upload successful!', publicUrl);

      // const values = getValues();
      // const personalId = await addPersonal(values);
      // await addRequest(personalId);

      // router.push('/success'); // Navigate to success page

    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout header={'Take A Photo'} description={''}>
      <View className="flex-1 justify-between gap-7">
        <View className="flex-1 gap-7">
          <View className="flex-1 items-center justify-center bg-lightBlue-2 rounded-md gap-3 p-4">
            <FaceDetectionCam 
              ref={cameraRef}
              setIsValid={setIsValid} 
              isValid={isValid}
            />
            {isValid ? (
              <Text className="text-green-600 text-center">Valid face detected</Text>
            ) : (
              <Text className="text-red-600 text-center">Please show your full face</Text>
            )}
          </View>
        </View>

        <View>
          <Button
            onPress={submit}
            className="bg-primaryBlue native:h-[57px]"
            disabled={!isValid || isUploading}
          >
            <Text className="text-white font-bold text-[16px]">
              {isUploading ? 'Uploading...' : 'Submit'}
            </Text>
          </Button>
        </View>
      </View>
    </Layout>
  );
}