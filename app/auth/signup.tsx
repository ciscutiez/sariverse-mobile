import { useState } from 'react';
import { View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text } from '~/components/nativewindui/Text';
import { Button } from '~/components/nativewindui/Button';
import { useSupabase } from '~/lib/supabase';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  storeName: z.string().min(2, 'Store name is required'),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });
  const { supabase } = useSupabase();

  const onSubmit = async (data: SignUpForm) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            store_name: data.storeName,
          },
        },
      });

      if (error) throw error;
      // Handle successful signup
    } catch (error) {
      console.error('Error signing up:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-4 bg-background">
      <View className="space-y-6">
        <Text variant="largeTitle" className="text-center mb-6">Create Account</Text>
        
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View className="space-y-2">
              <Text>First Name</Text>
              <View className="border border-gray-300 rounded-lg p-2">
                <Text onChangeText={onChange} value={value} />
              </View>
              {error && <Text className="text-red-500">{error.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View className="space-y-2">
              <Text>Last Name</Text>
              <View className="border border-gray-300 rounded-lg p-2">
                <Text onChangeText={onChange} value={value} />
              </View>
              {error && <Text className="text-red-500">{error.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="storeName"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View className="space-y-2">
              <Text>Store Name</Text>
              <View className="border border-gray-300 rounded-lg p-2">
                <Text onChangeText={onChange} value={value} />
              </View>
              {error && <Text className="text-red-500">{error.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View className="space-y-2">
              <Text>Email</Text>
              <View className="border border-gray-300 rounded-lg p-2">
                <Text onChangeText={onChange} value={value} />
              </View>
              {error && <Text className="text-red-500">{error.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View className="space-y-2">
              <Text>Password</Text>
              <View className="border border-gray-300 rounded-lg p-2">
                <Text onChangeText={onChange} value={value} secureTextEntry />
              </View>
              {error && <Text className="text-red-500">{error.message}</Text>}
            </View>
          )}
        />

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          className="mt-4"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </View>
    </View>
  );
}
