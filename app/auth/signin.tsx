import { useState } from 'react';
import { View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text } from '~/components/nativewindui/Text';
import { Button } from '~/components/nativewindui/Button';

import { Link } from 'expo-router';
import { supabase } from '~/utils/supabase';
import { TextInput } from 'react-native-gesture-handler';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });


  const onSubmit = async (data: SignInForm) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      // Handle successful sign in - will be handled by auth state change
    } catch (error) {
      console.error('Error signing in:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-4 bg-background">
      <View className="space-y-6">
        <Text variant="largeTitle" className="text-center mb-6">Sign In</Text>
        
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View className="space-y-2">
              <Text>Email</Text>
             <TextInput
                className="border border-gray-300 rounded-lg p-2"
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
              />
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
             <TextInput
                className="border border-gray-300 rounded-lg p-2"
                onChangeText={onChange}
                value={value}
                secureTextEntry
              />
              {error && <Text className="text-red-500">{error.message}</Text>}
            </View>
          )}
        />

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          className="mt-4"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>

        <View className="flex-row justify-center mt-4">
          <Text className="text-muted-foreground">Don't have an account? </Text>
          <Link href="/auth/signup">
            <Text className="text-primary">Sign Up</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
