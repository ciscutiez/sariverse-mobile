import { View, ScrollView } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '@roninoss/icons';
import { Text } from '~/components/nativewindui/Text';
import { Button } from '~/components/nativewindui/Button';
import { Input } from '~/components/Input';
import { useGetDebtorById, useUpdateDebtor } from '~/hooks/debtor';
import { useColorScheme } from '~/lib/useColorScheme';

const editDebtorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional().nullable(),
  address: z.string().min(5, 'Address must be at least 5 characters').optional().nullable(),
  credit_limit: z.number({
    error: 'Please enter a credit limit',
  }).min(0, 'Credit limit must be greater than 0'),
});

type EditDebtorForm = z.infer<typeof editDebtorSchema>;

export default function EditDebtorScreen() {
  const { colors } = useColorScheme();
  const { id, slug } = useLocalSearchParams<{ id: string; slug: string }>();
  const [error, setError] = useState<string | null>(null);

  const { data: debtor } = useGetDebtorById(id);
  const { mutate: updateDebtor, isLoading } = useUpdateDebtor();

  const { control, handleSubmit } = useForm<EditDebtorForm>({
    resolver: zodResolver(editDebtorSchema),
    defaultValues: {
      name: debtor?.name,
      email: debtor?.email,
      phone: debtor?.phone,
      address: debtor?.address,
      credit_limit: debtor?.credit_limit,
    },
  });

  const onSubmit = async (data: EditDebtorForm) => {
    try {
      await updateDebtor({
        id: Number(id),
        ...data,
      });
      
      // Create new slug from updated name
      const newSlug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Navigate back to the debtor details with new slug
      router.replace(`/debtors/${id}/${newSlug}`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  if (!debtor) return null;

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="space-y-6">
        <View className="space-y-2">
          <Text variant="title1">Edit Debtor</Text>
          <Text variant="body" color="tertiary">
            Update debtor information
          </Text>
        </View>

        {error && (
          <Text className="text-red-500 text-center">{error}</Text>
        )}

        <View className="space-y-4">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                label="Name"
                value={value}
                onChangeText={onChange}
                error={error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                label="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value || ''}
                onChangeText={onChange}
                error={error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                label="Phone"
                keyboardType="phone-pad"
                value={value || ''}
                onChangeText={onChange}
                error={error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                label="Address"
                multiline
                numberOfLines={3}
                value={value || ''}
                onChangeText={onChange}
                error={error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="credit_limit"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                label="Credit Limit"
                keyboardType="numeric"
                value={value?.toString()}
                onChangeText={(text) => onChange(Number(text))}
                error={error?.message}
              />
            )}
          />
        </View>

        <Button
          variant="primary"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text className="text-white">Updating...</Text>
          ) : (
            <>
              <Icon name="save" size={16} color="white" />
              <Text className="text-white">Save Changes</Text>
            </>
          )}
        </Button>
      </View>
    </ScrollView>
  );
}
