import { useState } from 'react';
import { View, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '~/lib/auth';
import { Text } from '~/components/nativewindui/Text';
import { Button } from '~/components/nativewindui/Button';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  storeName: z.string().optional(),
  role: z.enum(['store_owner', 'shopper']),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, watch, setValue } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { role: 'store_owner' },
  });

  const role = watch('role');

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
            store_name: data.role === 'store_owner' ? data.storeName : '',
            role: data.role,
          },
        },
      });
      if (error) throw error;
      // success handling
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Background glow */}
      <LinearGradient
        colors={['#0f0f1f', '#1a0b2e', '#000']}
        style={{ position: 'absolute', inset: 0 }}
      />
      <View className="absolute top-20 left-20 w-80 h-80 rounded-full bg-purple-800/20 blur-3xl" />
      <View className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-pink-600/20 blur-3xl" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="px-6 py-12"
      >
        {/* Header */}
        <View className="items-center space-y-4 mb-8">
          <View className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-700 to-purple-700 items-center justify-center border border-violet-500/30">
            <Ionicons name="person-add" size={28} color="white" />
          </View>
          <Text variant="title1" className="text-white font-bold">
            Create Your Account
          </Text>
          <Text className="text-slate-400">Join Sariverse and start your journey</Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          {/* First & Last Name */}
          <View className="flex-row gap-4">
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View className="flex-1">
                  <Text className="text-slate-300 mb-1">First Name</Text>
                  <TextInput
                    className="bg-slate-800 text-white rounded-lg px-3 py-2"
                    placeholder="First name"
                    placeholderTextColor="#94a3b8"
                    onChangeText={onChange}
                    value={value}
                  />
                  {error && <Text className="text-red-500 text-xs">{error.message}</Text>}
                </View>
              )}
            />
            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View className="flex-1">
                  <Text className="text-slate-300 mb-1">Last Name</Text>
                  <TextInput
                    className="bg-slate-800 text-white rounded-lg px-3 py-2"
                    placeholder="Last name"
                    placeholderTextColor="#94a3b8"
                    onChangeText={onChange}
                    value={value}
                  />
                  {error && <Text className="text-red-500 text-xs">{error.message}</Text>}
                </View>
              )}
            />
          </View>

          {/* Role selection */}
          <Text className="text-slate-300">I want to register as</Text>
          <View className="flex-row gap-4">
            {[
              { value: 'store_owner', label: 'Store Owner', icon: 'storefront' },
              { value: 'shopper', label: 'Shopper', icon: 'cart' },
            ].map((item) => (
              <Pressable
                key={item.value}
                onPress={() => setValue('role', item.value)}
                className={`flex-1 rounded-xl p-4 items-center ${
                  role === item.value
                    ? 'border border-violet-500 bg-violet-600/10'
                    : 'border border-slate-600 bg-slate-700/30'
                }`}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={role === item.value ? '#a78bfa' : '#94a3b8'}
                />
                <Text className="mt-2 text-white">{item.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Store name only if store_owner */}
          {role === 'store_owner' && (
            <Controller
              control={control}
              name="storeName"
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <View>
                  <Text className="text-slate-300 mb-1">Store Name</Text>
                  <TextInput
                    className="bg-slate-800 text-white rounded-lg px-3 py-2"
                    placeholder="Enter your store name"
                    placeholderTextColor="#94a3b8"
                    onChangeText={onChange}
                    value={value}
                  />
                  {error && <Text className="text-red-500 text-xs">{error.message}</Text>}
                </View>
              )}
            />
          )}

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <Text className="text-slate-300 mb-1">Email</Text>
                <TextInput
                  className="bg-slate-800 text-white rounded-lg px-3 py-2"
                  placeholder="Enter your email"
                  placeholderTextColor="#94a3b8"
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {error && <Text className="text-red-500 text-xs">{error.message}</Text>}
              </View>
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View>
                <Text className="text-slate-300 mb-1">Password</Text>
                <TextInput
                  className="bg-slate-800 text-white rounded-lg px-3 py-2"
                  placeholder="Create a password"
                  placeholderTextColor="#94a3b8"
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                />
                {error && <Text className="text-red-500 text-xs">{error.message}</Text>}
              </View>
            )}
          />

          {/* Submit */}
          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            className="bg-violet-500 w-full mt-6"
          >
            {loading ? <ActivityIndicator color="#fff" /> : 'Create Account'}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
