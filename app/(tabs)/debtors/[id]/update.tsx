'use client';

import { View, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, User, CreditCard, Edit3 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '~/components/nativewindui/Text';
import { useGetDebtorById, useUpdateDebtor } from '~/hooks/debtor';
import { Button } from '~/components/nativewindui/Button';

export default function UpdateDebtorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: debtor, isLoading } = useGetDebtorById(id!);
  const updateDebtor = useUpdateDebtor();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',

    credit_limit: '',
    balance: '',
    status: 'active',
    is_settled: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (debtor) {
      setFormData({
        name: debtor.name || '',
        email: debtor.email || '',
        phone: debtor.phone || '',
   
        credit_limit: debtor.credit_limit.toString(),
        balance: debtor.balance.toString(),
        status: debtor.status,
        is_settled: debtor.is_settled ?? false,
      });
    }
  }, [debtor]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.credit_limit) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await updateDebtor.mutateAsync({
        id: id!,
        ...formData,
        credit_limit: Number.parseFloat(formData.credit_limit),
        balance: Number.parseFloat(formData.balance),
      });
      Alert.alert('Success', 'Debtor updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to update debtor');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Purple Gradient Header */}
      <LinearGradient
        colors={['#8B5CF6', '#A855F7', '#C084FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-8 pt-16">
        <View className="mb-6 flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-bold text-white">Update Debtor</Text>
            <Text className="text-base text-white/80">Edit customer information</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="-mt-4 flex-1">
        <View className="space-y-6 rounded-t-3xl bg-white px-6 pt-6 shadow-sm">
          {/* Basic Information */}
          <View className="space-y-4">
            <View className="mb-4 flex-row items-center gap-3">
              <LinearGradient
                colors={['#E0E7FF', '#C7D2FE']}
                className="h-10 w-10 items-center justify-center rounded-full">
                <User size={20} color="#3730A3" />
              </LinearGradient>
              <Text className="text-lg font-bold text-gray-900">Basic Information</Text>
            </View>

            <FormField
              label="Full Name *"
              value={formData.name}
              onChangeText={(t: any) => setFormData((p) => ({ ...p, name: t }))}
              placeholder="Enter customer name"
            />
            <FormField
              label="Email Address"
              value={formData.email}
              onChangeText={(t: any) => setFormData((p) => ({ ...p, email: t }))}
              placeholder="customer@example.com"
              keyboardType="email-address"
            />
            <FormField
              label="Phone Number"
              value={formData.phone}
              onChangeText={(t: any) => setFormData((p) => ({ ...p, phone: t }))}
              placeholder="+63 XXX XXX XXXX"
              keyboardType="phone-pad"
            />
      
          </View>

          {/* Credit Information */}
          <View className="space-y-4">
            <View className="mb-4 flex-row items-center gap-3">
              <LinearGradient
                colors={['#D1FAE5', '#A7F3D0']}
                className="h-10 w-10 items-center justify-center rounded-full">
                <CreditCard size={20} color="#065F46" />
              </LinearGradient>
              <Text className="text-lg font-bold text-gray-900">Credit Information</Text>
            </View>

            <FormField
              label="Credit Limit *"
              value={formData.credit_limit}
              onChangeText={(t: any) => setFormData((p) => ({ ...p, credit_limit: t }))}
              placeholder="0.00"
              keyboardType="numeric"
              prefix="₱"
            />
            <FormField
              label="Current Balance"
              value={formData.balance}
              onChangeText={(t: any) => setFormData((p) => ({ ...p, balance: t }))}
              placeholder="0.00"
              keyboardType="numeric"
              prefix="₱"
            />

            {/* Status */}
            <View className="space-y-2">
              <Text className="font-medium text-gray-900">Account Status</Text>
              <View className="flex-row gap-3">
                {(['active', 'due-soon', 'overdue', 'settled'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() =>
                      setFormData((p) => ({ ...p, status, is_settled: status === 'settled' }))
                    }>
                    {formData.status === status ? (
                      <LinearGradient
                        colors={['#8B5CF6', '#A855F7']}
                        className="rounded-full px-4 py-2">
                        <Text className="font-medium capitalize text-white">
                          {status.replace('-', ' ')}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View className="rounded-full border border-gray-300 bg-white px-4 py-2">
                        <Text className="capitalize text-gray-500">{status.replace('-', ' ')}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Submit */}
          <View className="pb-8 pt-6">
            <Button
              className="flex-row items-center justify-center gap-2 bg-black"
              onPress={handleSubmit}
              disabled={loading}>
              <Edit3 size={20} color="white" />
              <Text className="text-lg font-bold text-white">
                {loading ? 'Updating...' : 'Update Debtor'}
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  prefix,
}: any) {
  return (
    <View className="space-y-2">
      <Text className="font-medium text-gray-900">{label}</Text>
      <View className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <View className="flex-row items-center">
          {prefix && (
            <View className="bg-gray-50 px-4 py-4">
              <Text className="font-medium text-gray-500">{prefix}</Text>
            </View>
          )}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            className="flex-1 px-4 py-4 text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>
    </View>
  );
}
