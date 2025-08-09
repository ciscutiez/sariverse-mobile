// app/orders/new.tsx
import { View, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Text } from '~/components/nativewindui/Text';
import { Button } from '~/components/nativewindui/Button';

import { useCreateOrder } from '~/hooks/order';

import { Input } from '~/components/Input';
import { Loader } from 'lucide-react-native';

export default function NewOrderScreen() {
  const router = useRouter();
  const createOrder = useCreateOrder();

  const [customerName, setCustomerName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed' | 'cancelled'>('pending');

  const handleSubmit = async () => {
    if (!customerName || !totalAmount) {
      Alert.alert('Validation', 'Please fill in all required fields.');
      return;
    }

    try {
      await createOrder.mutateAsync({
      customer_name: customerName,
        total_amount: parseFloat(totalAmount),
        status,
      });
      router.push('/orders' as any);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text variant="title1" className="mb-4">New Order</Text>

      <View className="space-y-4">
        <Input
          label="Customer Name"
          placeholder="Enter customer name"
          value={customerName}
          onChangeText={setCustomerName}
        />

        <Input
          label="Total Amount"
          placeholder="₱0.00"
          keyboardType="numeric"
          value={totalAmount}
          onChangeText={setTotalAmount}
        />

        {/* Simple status selector */}
        <View className="flex-row gap-2">
          {(['pending', 'completed', 'cancelled'] as const).map((s) => (
            <Button
              key={s}
              variant={status === s ? 'primary' : 'secondary'}
              onPress={() => setStatus(s)}
            >
              <Text className={status === s ? 'text-white' : ''}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </Button>
          ))}
        </View>

        <Button variant="primary" onPress={handleSubmit} disabled={createOrder.isPending}>
          {createOrder.isPending ? (
            <Loader  size={16} color="white" />
          ) : (
            <Text className="text-white">Create Order</Text>
          )}
        </Button>
      </View>
    </ScrollView>
  );
}
