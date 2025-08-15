import { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react-native';
import { Text } from '~/components/nativewindui/Text';
import { Button } from '~/components/nativewindui/Button';
import { router } from 'expo-router';
import { supabase } from '~/lib/auth';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import SariverseLogo from '~/components/sariverse-logo';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const scale = useSharedValue(1);

  const { control, handleSubmit } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: SignInForm) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
    router.push('/(tabs)/products');
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setLoading(false);
    }
  };

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-black">
      {/* Background gradients */}
      <LinearGradient colors={['#0f0f1f', '#1a0b2e', '#000']} className="absolute inset-0" />
      <View className="absolute left-10 top-20 h-72 w-72 rounded-full bg-purple-800/20 blur-3xl" />
      <View className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-pink-600/20 blur-3xl" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="mb-10 items-center space-y-6">
          <View className="relative">
            <SariverseLogo size={80} />
          </View>

          <View className="flex-row items-center space-x-2">
            <Sparkles size={18} color="#a78bfa" />
            <Text className="text-3xl font-bold text-white">Welcome Back</Text>
            <Sparkles size={18} color="#d8b4fe" />
          </View>

          <Text className="text-center text-lg text-slate-400">
            Sign in to your Sariverse account
          </Text>
        </View>

        {/* Form */}
        <Animated.View
          style={formAnimatedStyle}
          onTouchStart={() => {
            scale.value = withSpring(1.03);
          }}
          onTouchEnd={() => {
            scale.value = withSpring(1);
          }}
          className="gap-4 space-y-5 rounded-2xl border border-violet-500/20 bg-black/40 p-5">
          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View className="space-y-1">
                <View className="relative">
                  <Mail
                    size={18}
                    color="#9ca3af"
                    style={{ position: 'absolute', left: 10, top: 14 }}
                  />
                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#9ca3af"
                    className="rounded-lg border border-gray-700 bg-black/50 py-3 pl-10 pr-3 text-white"
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {error && <Text className="text-sm text-red-500">{error.message}</Text>}
              </View>
            )}
          />

          {/* Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View className="space-y-1">
                <View className="relative">
                  <Lock
                    size={18}
                    color="#9ca3af"
                    style={{ position: 'absolute', left: 10, top: 14 }}
                  />
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    className="rounded-lg border border-gray-700 bg-black/50 py-3 pl-10 pr-10 text-white"
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3">
                    {showPassword ? (
                      <EyeOff size={18} color="#9ca3af" />
                    ) : (
                      <Eye size={18} color="#9ca3af" />
                    )}
                  </TouchableOpacity>
                </View>
                {error && <Text className="text-sm text-red-500">{error.message}</Text>}
              </View>
            )}
          />

          {/* Forgot password */}
          <TouchableOpacity className="self-end">
            <Text className="text-sm text-violet-400">Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <Button
            variant="primary"
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            className="w-full rounded-lg bg-violet-500 py-3">
            {loading ? (
              <View className="flex-row items-center justify-center">
                <Loader2 size={18} color="white" className="mr-2" />
                <Text className="text-white">Signing in...</Text>
              </View>
            ) : (
              <Text className="font-semibold text-white">Sign In</Text>
            )}
          </Button>
        </Animated.View>

        {/* Footer security info */}
        <View className="mt-6 items-center space-y-2">
          <Text className="text-xs text-slate-500">
            Secure Authentication • Protected by SSL • Privacy First
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
