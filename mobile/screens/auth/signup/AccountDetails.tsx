import "@/global.css";

import React from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "./_layout";
import { Eye } from '@/lib/icons/Eye'
import { EyeOff } from '@/lib/icons/EyeOff'

export default function AccountDetails(){
  const router = useRouter();
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rePass, setRePass] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showRePassword, setShowRePassword] = React.useState(false);

  const handleProceed = () => {
    // if (!username || !email || !password || !rePass) {
    //   alert('Error', 'Please fill out all required fields.');
    //   return;
    // }

    // if (password !== rePass) {
    //   alert('Error', 'Passwords do not match.');
    //   return;
    // }

    // console.log('Proceeding with info:', username, email, password);
    router.push('/personal-information');
  };

  return (
    <Layout
        header={'Account Details'}
        description={'Please fill out all required fields.'}
    >
        <View className="flex-1">
            <View className="flex-1 flex-col gap-3">
                {/* Input Fields */}
                <View> 
                    <Text className="text-[15px] font-PoppinsRegular">Username</Text>
                    <Input 
                        className="h-[57px] font-PoppinsRegular"    
                        placeholder="Username" 
                        value={username} 
                        onChangeText={setUsername} 
                    />
                </View>
                <View>
                    <Text className="text-[15px] font-PoppinsRegular">Email</Text>
                    <Input 
                        className="h-[57px] font-PoppinsRegular"    
                        placeholder="Email" 
                        value={email} 
                        onChangeText={setEmail} 
                    />
                </View>
                <View>
                    <Text className="text-[15px] font-PoppinsRegular">Password</Text>
                    <View className="relative">
                        <Input 
                            className="h-[57px] font-PoppinsRegular"    
                            placeholder="Password" 
                            value={password} 
                            onChangeText={setPassword} 
                            secureTextEntry={!showPassword}
                        />

                        {password.length > 0 &&
                            <TouchableWithoutFeedback onPress={()=>{setShowPassword(!showPassword)}}>
                                <View className="absolute right-5 top-1/2 transform -translate-y-1/2">
                                    {showPassword ? <Eye className="text-gray-700"/> : <EyeOff className="text-gray-700"/>}
                                </View>
                            </TouchableWithoutFeedback>
                        }
                    </View>
                    
                </View>
                <View>
                    <Text className="text-[15px] font-PoppinsRegular">Re-enter Password</Text>
                    <View className="relative">
                        <Input 
                            className="h-[57px] font-PoppinsRegular"    
                            placeholder="Re-enter Password" 
                            value={rePass} 
                            onChangeText={setRePass} 
                            secureTextEntry={!showRePassword}
                        />

                        {rePass.length > 0 &&
                             <TouchableWithoutFeedback onPress={()=>{setShowRePassword(!showRePassword)}}>
                                <View className="absolute right-5 top-1/2 transform -translate-y-1/2">
                                    {showRePassword ? <Eye className="text-gray-700"/> : <EyeOff className="text-gray-700"/>}
                                </View>
                            </TouchableWithoutFeedback>
                        }
                    </View>
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