'use client';

import { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Text } from '~/components/nativewindui/Text';
import { useGetProducts, useUpdateProduct } from '~/hooks/product';
import { ArrowLeft } from 'lucide-react-native';
import { Button } from '~/components/nativewindui/Button';

type FormData = {
  name: string;
  category: string;
  price: number;
  supplier?: string;
  description?: string;
};

export default function UpdateProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState('');

  const updateProduct = useUpdateProduct();
  const { data: products } = useGetProducts();
  const categories = [
    'Food',
    'Cigarette',
    'Snacks', // chips, biscuits, candies
    'Beverages', // soft drinks, juice, water, coffee, tea
    'Instant Noodles',
    'Condiments', // soy sauce, vinegar, ketchup, spices
    'Personal Care', // soap, toothpaste, deodorant
    'Household Supplies', // detergent, dishwashing liquid, tissue
    'Baby Products', // diapers, baby wipes, formula
    'Alcohol', // beer, gin, rum
    'Stationery', // pens, notebooks, envelopes
    'Medicines', // paracetamol, vitamins, basic first aid
    'Canned Goods', // sardines, corned beef, tuna
    'Frozen Food', // ice cream, frozen meats
    'Pet Supplies', // dog food, cat food
    'Recharge Cards', // mobile load, prepaid cards
    'Others',
  ];

  const product = products?.find((p) => p.id === Number(id));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        category: product.category,
        price: product.price,
        supplier: product.supplier || '',
        description: product.description || '',
      });
      if (product.product_image) {
        setImageUrl([product.product_image]);
      }
    }
  }, [product, reset]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUrl([...imageUrl, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImageUrl(imageUrl.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    if (!product) return;

    try {
      await updateProduct.mutateAsync({
        id: product.id,
        ...data,
        product_image: imageUrl[0] || null,
      });

      Alert.alert('Success', 'Product updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to update product. Please try again.');
    }
  };

  const CategoryModal = () => (
    <Modal
      visible={categoryModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setCategoryModalVisible(false)}>
      <View className="flex-1 justify-end bg-black/30">
        <View className="max-h-[70%] rounded-t-3xl bg-white">
          <View className="flex-row items-center justify-between border-b border-gray-200 p-5">
            <Text className="text-lg font-semibold text-gray-900">Select Category</Text>
            <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="border-b border-gray-200 p-4"
                onPress={() => {
                  control._formValues.category = item;
                  setCategoryModalVisible(false);
                }}>
                <Text className="text-base text-gray-800">{item}</Text>
              </TouchableOpacity>
            )}
          />

          <View className="p-5">
            <TextInput
              className="mb-3 rounded-lg border border-gray-300 bg-gray-50 p-3 text-gray-900"
              placeholder="Create new category..."
              placeholderTextColor="#9ca3af"
              value={customCategory}
              onChangeText={setCustomCategory}
            />
            <TouchableOpacity
              className="items-center rounded-lg bg-violet-600 p-3"
              onPress={() => {
                if (customCategory.trim()) {
                  control._formValues.category = customCategory;
                  setCustomCategory('');
                  setCategoryModalVisible(false);
                }
              }}>
              <Text className="font-semibold text-white">Create Category</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="mt-4 text-gray-700">Loading product...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <LinearGradient colors={['#8b5cf6', '#a855f7', '#c084fc']} className="px-5 pb-5 pt-16">
        <View className="flex-row items-center justify-between">
         <Button
            variant="black"
            className="bg-white/20 border-0 rounded-full w-10 h-10 p-0"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="white" />
          </Button>
          <Text className="flex-1 text-center text-xl font-bold text-white">Edit Product</Text>
          <View className="w-6" />
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          {/* Image Upload Section */}
          <View className="mb-6 rounded-2xl border border-gray-300 bg-white p-5 shadow-sm">
            <View className="mb-4 flex-row items-center">
              <Ionicons name="camera" size={20} color="#8b5cf6" />
              <Text className="ml-2 text-base font-semibold text-gray-900">Product Images</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {imageUrl.map((uri, index) => (
                  <View key={index} className="relative">
                    <Image source={{ uri }} className="h-20 w-20 rounded-xl" />
                    <TouchableOpacity
                      className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full bg-red-500"
                      onPress={() => removeImage(index)}>
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  className="h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-100"
                  onPress={pickImage}>
                  <Ionicons name="add" size={24} color="#8b5cf6" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {/* Basic Information */}
          <View className="mb-6 rounded-2xl border border-gray-300 bg-white p-5 shadow-sm">
            <View className="mb-5 flex-row items-center">
              <Ionicons name="cube" size={20} color="#8b5cf6" />
              <Text className="ml-2 text-base font-semibold text-gray-900">Basic Information</Text>
            </View>

            {/* Product Name */}
            <View className="mb-5">
              <Text className="mb-2 text-sm font-medium text-gray-700">Product Name *</Text>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Product name is required' }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className={`rounded-xl border bg-white p-4 text-base text-gray-900 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter product name"
                    placeholderTextColor="#9ca3af"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
              {errors.name && (
                <Text className="mt-1 text-xs text-red-500">{errors.name.message}</Text>
              )}
            </View>

            {/* Category and Price Row */}
            <View className="mb-5 flex-row gap-4">
              <View className="flex-1">
                <Text className="mb-2 text-sm font-medium text-gray-700">Category *</Text>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Category is required' }}
                  render={({ field: { value } }) => (
                    <TouchableOpacity
                      className={`flex-row items-center justify-between rounded-xl border bg-white p-4 ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                      onPress={() => setCategoryModalVisible(true)}>
                      <Text className={`text-base ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                        {value || 'Select category'}
                      </Text>
                      <Ionicons name="chevron-down" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                />
                {errors.category && (
                  <Text className="mt-1 text-xs text-red-500">{errors.category.message}</Text>
                )}
              </View>

              <View className="flex-1">
                <Text className="mb-2 text-sm font-medium text-gray-700">Price (₱) *</Text>
                <Controller
                  name="price"
                  control={control}
                  rules={{
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      className={`rounded-xl border bg-white p-4 text-base text-gray-900 ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      placeholderTextColor="#9ca3af"
                      value={value?.toString()}
                      onChangeText={(text) => onChange(Number.parseFloat(text) || 0)}
                      keyboardType="numeric"
                    />
                  )}
                />
                {errors.price && (
                  <Text className="mt-1 text-xs text-red-500">{errors.price.message}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Additional Details */}
          <View className="mb-6 rounded-2xl border border-gray-300 bg-white p-5 shadow-sm">
            <View className="mb-5 flex-row items-center">
              <Ionicons name="person" size={20} color="#8b5cf6" />
              <Text className="ml-2 text-base font-semibold text-gray-900">Additional Details</Text>
            </View>

            {/* Supplier */}
            <View className="mb-5">
              <Text className="mb-2 text-sm font-medium text-gray-700">Supplier</Text>
              <Controller
                name="supplier"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="rounded-xl border border-gray-300 bg-white p-4 text-base text-gray-900"
                    placeholder="Enter supplier name"
                    placeholderTextColor="#9ca3af"
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />
            </View>

            {/* Description */}
            <View>
              <Text className="mb-2 text-sm font-medium text-gray-700">Description</Text>
              <Controller
                name="description"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="h-24 rounded-xl border border-gray-300 bg-white p-4 text-base text-gray-900"
                    placeholder="Add product description..."
                    placeholderTextColor="#9ca3af"
                    value={value}
                    onChangeText={onChange}
                    multiline
                    textAlignVertical="top"
                  />
                )}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mb-10 flex-row gap-3">
            <TouchableOpacity
              className="flex-1 items-center rounded-xl bg-red-500 p-4"
              onPress={() => router.back()}
              disabled={updateProduct.isPending}>
              <Text className="text-base font-semibold text-white">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center rounded-xl bg-black p-4"
              onPress={handleSubmit(onSubmit)}
              disabled={updateProduct.isPending}>
              {updateProduct.isPending && (
                <ActivityIndicator size="small" color="white" className="mr-2" />
              )}
              <Text className="text-base font-semibold text-white">
                {updateProduct.isPending ? 'Updating...' : 'Update Product'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CategoryModal />
    </View>
  );
}
