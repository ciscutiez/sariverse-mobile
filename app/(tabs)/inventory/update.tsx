'use client';
import { View, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Save, Calculator, TrendingUp, DollarSign, Percent } from 'lucide-react-native';

import { Text } from '~/components/nativewindui/Text';

import { Button } from '~/components/nativewindui/Button';
import { useColorScheme } from '~/lib/useColorScheme';
import { useUpdateInventory } from '~/hooks/inventory';

export default function UpdateInventoryScreen() {
  const { colors } = useColorScheme();
  const router = useRouter();
  const { id, name, quantity: initialQuantity, srp: initialSrp, price } = useLocalSearchParams();

  const [quantity, setQuantity] = useState(initialQuantity?.toString() || '0');
  const [srp, setSrp] = useState(initialSrp?.toString() || '0');
  const [isLoading, setIsLoading] = useState(false);

  const updateInventory = useUpdateInventory();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const calculateMargin = () => {
    const priceNum = Number(price) || 0;
    const srpNum = Number(srp) || 0;
    if (!priceNum || !srpNum || srpNum === 0) return 0;
    return ((srpNum - priceNum) / srpNum) * 100;
  };

  const calculateMarkup = () => {
    const priceNum = Number(price) || 0;
    const srpNum = Number(srp) || 0;
    if (!priceNum || !srpNum || priceNum === 0) return 0;
    return ((srpNum - priceNum) / priceNum) * 100;
  };

  const getProfitPerUnit = () => {
    const priceNum = Number(price) || 0;
    const srpNum = Number(srp) || 0;
    return srpNum - priceNum;
  };

  const handleUpdate = async () => {
    if (!quantity || Number(quantity) < 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      return;
    }

    if (Number(srp) < 0) {
      Alert.alert('Invalid Price', 'Please enter a valid retail price');
      return;
    }

    setIsLoading(true);
    try {
      await updateInventory.mutateAsync({
        id: id as string,
        stock: Number(quantity),
        srp: Number(srp) > 0 ? Number(srp) : null,
      });

      Alert.alert('Success', 'Inventory updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to update inventory. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-b-3xl px-6 pb-6 pt-12">
          <View className="mb-4 flex-row items-center justify-between">
            <Pressable onPress={() => router.back()} className="rounded-full bg-white/20 p-2">
              <ArrowLeft size={20} color="white" />
            </Pressable>
            <Text className="mr-10 flex-1 text-center text-lg font-semibold text-white">
              Update Inventory
            </Text>
          </View>

          <View className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <Text className="text-xl font-bold text-white">{name}</Text>
            <Text className="mt-1 text-sm text-white/80">Modify stock and pricing</Text>
          </View>
        </LinearGradient>

        <View className="-mt-4 px-6">
          {/* Form Section */}
          <View
            className="mb-6 rounded-2xl bg-gray-50 p-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}>
            <View className="mb-4 flex-row items-center">
              <View className="mr-3 rounded-full bg-blue-500/20 p-2">
                <Calculator size={20} color="#3b82f6" />
              </View>
              <Text className="text-lg font-semibold text-black">Stock Information</Text>
            </View>

            {/* Quantity Input */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-500">Quantity</Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Enter quantity"
                keyboardType="numeric"
                className="bg-muted/50 rounded-xl border border-border px-4 py-3 text-black"
              />
            </View>

            {/* SRP Input */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-500">
                Retail Price (SRP)
              </Text>
              <TextInput
                value={srp}
                onChangeText={setSrp}
                placeholder="0.00"
                keyboardType="numeric"
                className="bg-muted/50 rounded-xl border border-border px-4 py-3 text-black"
              />
            </View>

            {/* Original Price Display */}
            {price && (
              <View className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                <Text className="text-sm font-medium text-blue-600">
                  Original Price: {formatCurrency(Number(price))}
                </Text>
              </View>
            )}
          </View>

          {/* Profit Analysis */}
          {Number(price) > 0 && Number(srp) > 0 && (
            <View
              className="mb-6 rounded-2xl bg-card p-6"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}>
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 rounded-full bg-green-500/20 p-2">
                  <TrendingUp size={20} color="#10b981" />
                </View>
                <Text className="text-lg font-semibold text-foreground">Profit Analysis</Text>
              </View>

              <View className="gap-4 space-y-4">
                {/* Margin */}
                <View className="bg-muted/30 flex-row items-center justify-between rounded-xl p-3">
                  <View className="flex-row items-center">
                    <Percent size={16} color={colors.muted} />
                    <Text className="ml-2 text-sm text-muted-foreground">Margin</Text>
                  </View>
                  <Text
                    className={`font-bold ${calculateMargin() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculateMargin().toFixed(1)}%
                  </Text>
                </View>

                {/* Markup */}
                <View className="bg-muted/30 flex-row items-center justify-between rounded-xl p-3">
                  <View className="flex-row items-center">
                    <TrendingUp size={16} color={colors.muted} />
                    <Text className="ml-2 text-sm text-muted-foreground">Markup</Text>
                  </View>
                  <Text
                    className={`font-bold ${calculateMarkup() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculateMarkup().toFixed(1)}%
                  </Text>
                </View>

                {/* Profit per Unit */}
                <View className="bg-muted/30 flex-row items-center justify-between rounded-xl p-3">
                  <View className="flex-row items-center">
                    <DollarSign size={16} color={colors.muted} />
                    <Text className="ml-2 text-sm text-muted-foreground">Profit per Unit</Text>
                  </View>
                  <Text
                    className={`font-bold ${getProfitPerUnit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(getProfitPerUnit())}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row justify-center gap-3 pb-8">
            <Button
              variant="danger"
              onPress={() => router.back()}
              className="flex-1 py-4 px-10"
              disabled={isLoading}>
              <Text>Cancel</Text>
            </Button>

            <Button variant='black' onPress={handleUpdate} disabled={isLoading}   className="flex-1 py-4 px-10">
             
             
                <Text className="ml-2 font-semibold text-white">
                  {isLoading ? 'Updating...' : 'Update'}
                </Text>
        
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
