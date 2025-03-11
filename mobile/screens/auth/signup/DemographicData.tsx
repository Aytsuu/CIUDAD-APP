import "@/global.css";

import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "./_layout";

export default function DemographicData() {
  const router = useRouter();
  const [householdNo, setHouseholdNo] = React.useState('');
  const [familyNo, setFamilyNo] = React.useState('');

  const handleProceed = () => {
    // if (householdNo) {
      router.push('/account-details');
    // } else {
    //   alert('Please fill out all required fields.');
    // }
  };

  return (
    <Layout
      header={'Demographic Data'}
        description={'Please fill out all required fields.'}
    >
        <View className="flex-1">
            <View className="flex-1 flex-col gap-3">
                {/* Input Fields */}
                <View>
                    <Text className="text-[16px] font-PoppinsRegular">Household No.</Text>
                    <Input
                        className="h-[57px] font-PoppinsRegular text-[15px]"
                        placeholder="Household No."
                        value={householdNo}
                        onChangeText={setHouseholdNo}
                    />
                </View>

                <View>
                    <Text className="text-[16px] font-PoppinsRegular">Family No.</Text>
                    <Input
                        className="h-[57px] font-PoppinsRegular text-[15px]"
                        placeholder="Family No. (Leave blank if none)"
                        value={familyNo}
                        onChangeText={setFamilyNo}
                    />
                </View>
            </View>

            {/* Next Button */}
            <View>
                <Button
                    onPress={handleProceed}
                    className="bg-primaryBlue native:h-[57px]"
                >
                    <Text className="text-white font-bold text-[16px]">Next</Text>
                </Button>
            </View>
        </View>
    </Layout>
  );
};