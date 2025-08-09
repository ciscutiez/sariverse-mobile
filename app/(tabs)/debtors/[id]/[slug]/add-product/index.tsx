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
import { Picker, PickerItem } from '~/components/nativewindui/Picker';
import { useGetProducts } from '~/hooks/product';
import { useCreateDebtorProduct } from '~/hooks/debtor-product';
import { useColorScheme } from '~/lib/useColorScheme';

const addProductSchema = z.object({
  product_id: z.number({
    required_error: 'Please select a product',
  }),
  quantity: z.number({
    required_error: 'Please enter the quantity',
  }).min(1, 'Quantity must be at least 1'),
  total_price: z.number({
    required_error: 'Please enter the total price',
  }).min(0, 'Total price must be greater than 0'),
});

type AddProductForm = z.infer<typeof addProductSchema>;

export default function AddDebtorProductScreen() {
  const { colors } = useColorScheme();
  const { id, slug } = useLocalSearchParams<{ id: string; slug: string }>();
  const [error, setError] = useState<string | null>(null);
  const { data: products } = useGetProducts();
  
  const { mutate: createProduct, isLoading } = useCreateDebtorProduct();

  const { control, handleSubmit, watch, setValue } = useForm<AddProductForm>({
    resolver: zodResolver(addProductSchema),
  });

  const selectedProductId = watch('product_id');
  const selectedProduct = products?.find(p => p.id === selectedProductId);
  const quantity = watch('quantity') || 0;

  // Update total price when product or quantity changes
  React.useEffect(() => {
    if (selectedProduct && quantity) {
      setValue('total_price', selectedProduct.price * quantity);
    }
  }, [selectedProductId, quantity, selectedProduct, setValue]);

  const onSubmit = async (data: AddProductForm) => {
    try {
      await createProduct({
        ...data,
        debtor_id: id,
      });
      router.back();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="space-y-6">
        <View className="space-y-2">
          <Text variant="title1">Add Product</Text>
          <Text variant="body" color="tertiary">
            Add a product to this debtor's account
          </Text>
        </View>

        {error && (
          <Text className="text-red-500 text-center">{error}</Text>
        )}

        <View className="space-y-4">
          <Controller
            control={control}
            name="product_id"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <View className="space-y-2">
                <Text variant="subhead" color="secondary">Product</Text>
                <Picker
                  selectedValue={value}
                  onValueChange={(itemValue) => onChange(Number(itemValue))}
                >
                  <PickerItem label="Select a product" value="" />
                  {products?.map((product) => (
                    <PickerItem
                      key={product.id}
                      label={`${product.name} - ₱${product.price}`}
                      value={product.id}
                    />
                  ))}
                </Picker>
                {error && <Text className="text-red-500">{error.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="quantity"
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <Input
                label="Quantity"
                keyboardType="numeric"
                value={value?.toString()}
                onChangeText={(text) => onChange(Number(text))}
                error={error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="total_price"
            render={({ field: { value }, fieldState: { error } }) => (
              <View className="space-y-2">
                <Text variant="subhead" color="secondary">Total Price</Text>
                <Text variant="title2">₱{value?.toFixed(2) || '0.00'}</Text>
                {error && <Text className="text-red-500">{error.message}</Text>}
              </View>
            )}
          />
        </View>

        <Button
          variant="primary"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text className="text-white">Adding Product...</Text>
          ) : (
            <>
              <Icon name="plus" size={16} color="white" />
              <Text className="text-white">Add Product</Text>
            </>
          )}
        </Button>
      </View>
    </ScrollView>
  );
}
