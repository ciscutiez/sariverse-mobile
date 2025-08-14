import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Edit3,
  Phone,
  Mail,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Package,
  ShoppingCart,
  X,
  CreditCard,
} from 'lucide-react-native';
import { useAddProductToDebtor, useGetDebtorProducts } from '~/hooks/debtor-product';
import { useGetDebtorById } from '~/hooks/debtor';
import { useGetInventory } from '~/hooks/inventory';
import { useSettleDebtor } from '~/hooks/debtor-payment';

export default function DebtorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: debtor, isLoading, refetch } = useGetDebtorById(id!);
  const { data: debtorProducts = [] } = useGetDebtorProducts(id!);
  const { data: inventoryItems = [] } = useGetInventory();
  const settleDebtorMutation = useSettleDebtor();
  const addProductMutation = useAddProductToDebtor();
  const [refreshing, setRefreshing] = React.useState(false);
  const [showAddProductModal, setShowAddProductModal] = React.useState(false);
  const [showSettleModal, setShowSettleModal] = React.useState(false);
  const [paymentAmount, setPaymentAmount] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<'cash' | 'gcash'>('cash');
  const [settleLoading, setSettleLoading] = React.useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = React.useState('');
  const [quantity, setQuantity] = React.useState('1');
  const [customPrice, setCustomPrice] = React.useState('');
  const [useCustomPrice, setUseCustomPrice] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

const handleSettlePayment = async () => {
  if (!paymentAmount || Number.parseFloat(paymentAmount) <= 0) {
    Alert.alert('Error', 'Please enter a valid payment amount');
    return;
  }
  if (!debtor) return;
  
  const amount = Number.parseFloat(paymentAmount);
  if (amount > debtor.balance) {
    Alert.alert(
      'Error',
      `Payment amount cannot exceed current balance of ₱${debtor.balance.toLocaleString()}`
    );
    return;
  }

  setSettleLoading(true);
  try {
    const result = await settleDebtorMutation.mutateAsync({
      debtorId: id!,
      paymentAmount: amount,
      paymentMethod,
      customerName: debtor.name,
      profileId: null // You might want to pass the actual profile ID if available
    });

    // Safely handle the result with default values
    const success = result?.success ?? false;
    const remainingBalance = result?.remaining_balance ?? 0;
    const totalPaid = result?.total ?? amount;

    if (!success) {
      throw new Error(result?.error || 'Payment processing failed');
    }

    const isFullPayment = remainingBalance === 0;

    Alert.alert(
      'Payment Successful',
      `Payment of ₱${totalPaid.toLocaleString()} processed successfully.\n${
        isFullPayment
          ? 'Debtor has been fully settled!'
          : `Remaining balance: ₱${remainingBalance.toLocaleString()}`
      }`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowSettleModal(false);
            setPaymentAmount('');
            if (isFullPayment) {
              router.back();
            }
          },
        },
      ]
    );
  } catch (error) {
    Alert.alert(
      'Error', 
      error instanceof Error 
        ? error.message 
        : 'Failed to process payment'
    );
    console.error('Settlement error:', error);
  } finally {
    setSettleLoading(false);
  }
};

  const handleAddProduct = async () => {
    const selectedInventory = inventoryItems.find((item) => item.id === selectedInventoryId);
    if (!selectedInventory || !quantity) {
      Alert.alert('Error', 'Please select a product and enter quantity');
      return;
    }

    const qty = Number.parseInt(quantity);
    if (qty <= 0 || qty > selectedInventory.stock) {
      Alert.alert('Error', `Invalid quantity. Available stock: ${selectedInventory.stock}`);
      return;
    }

    const unitPrice = useCustomPrice ? Number.parseFloat(customPrice) : selectedInventory.srp;
    if (!unitPrice || unitPrice <= 0) {
      Alert.alert('Error', 'Invalid unit price');
      return;
    }

    const totalPrice = unitPrice * qty;

    if (!selectedInventory.product_id) {
      Alert.alert('Error', 'Selected product is invalid');
      return;
    }
    if (!debtor) {
      Alert.alert('Error', 'Debtor is not loaded');
      return;
    }

    setLoading(true);
    try {
      await addProductMutation.mutateAsync({
        debtorId: id!,
        productId: selectedInventory.product_id.toString(),
        quantity: qty,
        totalPrice,
      });

      Alert.alert('Success', 'Product added to debtor successfully');
      setShowAddProductModal(false);
      setSelectedInventoryId('');
      setQuantity('1');
      setCustomPrice('');
      setUseCustomPrice(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add product');
      console.error('Add product error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 ">
        <Text className="text-gray-500 ">Loading debtor details...</Text>
      </View>
    );
  }

  if (!debtor) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 ">
        <Text className="text-gray-500 ">Debtor not found</Text>
      </View>
    );
  }

  const creditUtilization = (debtor.balance / debtor.credit_limit) * 100;
  const isOverLimit = debtor.balance > debtor.credit_limit;
  const selectedInventory = inventoryItems.find((item) => item.id === selectedInventoryId);

  return (
    <View className="flex-1 bg-gray-50 ">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#8B5CF6', '#A855F7', '#C084FC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pb-8 pt-16">
          <View className="mb-6 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <ArrowLeft size={20} color="white" />
            </TouchableOpacity>
            <View className="flex-row gap-1 space-x-3">
              {debtor.balance > 0 && (
                <TouchableOpacity
                  onPress={() => setShowSettleModal(true)}
                  className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <CreditCard size={18} color="white" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setShowAddProductModal(true)}
                className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Plus size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push(`/debtors/${id}/update`)}
                className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Edit3 size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-gray-500">
              <Text className="text-2xl font-bold text-white">
                {debtor.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="mb-2 text-2xl font-bold text-white">{debtor.name}</Text>
            <Text className="text-base text-purple-100 opacity-90">{debtor.email}</Text>
          </View>
        </LinearGradient>

        {/* Contact Info */}
        <View className="mx-6 -mt-4 mb-6">
          <View className="rounded-2xl bg-white p-6 shadow-lg ">
            <View className="mb-4 flex-row items-center">
              <Phone size={20} color="#8B5CF6" />
              <Text className="ml-3 font-medium text-gray-900 ">
                {debtor.phone || 'No phone number'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Mail size={20} color="#8B5CF6" />
              <Text className="ml-3 font-medium text-gray-900">{debtor.email}</Text>
            </View>
          </View>
        </View>

        {/* Financial Overview */}
        <View className="mx-6 mb-6">
          <Text className="mb-4 text-xl font-bold text-gray-900 ">Financial Overview</Text>

          <View className="mb-4 flex-row gap-4 space-x-3">
            <View className="flex-1 rounded-2xl bg-white p-4 shadow-lg ">
              <LinearGradient
                colors={isOverLimit ? ['#EF4444', '#F87171'] : ['#10B981', '#34D399']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="mb-3 h-12 w-12 items-center justify-center rounded-xl">
                <DollarSign size={24} color="white" />
              </LinearGradient>
              <Text className="text-2xl font-bold text-gray-900 ">
                ₱{debtor?.balance?.toLocaleString() ?? '0'}
              </Text>
              <Text className="text-sm text-gray-500 ">Current Balance</Text>
            </View>

            <View className="flex-1 rounded-2xl bg-white p-4 shadow-lg ">
              <LinearGradient
                colors={['#3B82F6', '#60A5FA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="mb-3 h-12 w-12 items-center justify-center rounded-xl">
                <TrendingUp size={24} color="white" />
              </LinearGradient>
              <Text className="text-2xl font-bold text-gray-900 ">
                ₱{debtor.credit_limit.toLocaleString()}
              </Text>
              <Text className="text-sm text-gray-500 ">Credit Limit</Text>
            </View>
          </View>

          {/* Credit Utilization */}
          <View className="rounded-2xl bg-white p-6 shadow-lg ">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-900 ">Credit Utilization</Text>
              <Text
                className={`text-sm font-medium ${
                  isOverLimit
                    ? 'text-red-500'
                    : creditUtilization > 80
                      ? 'text-yellow-500'
                      : 'text-green-500'
                }`}>
                {creditUtilization.toFixed(1)}%
              </Text>
            </View>
            <View className="mb-2 h-3 rounded-full bg-gray-200 ">
              <View
                className={`h-3 rounded-full ${
                  isOverLimit
                    ? 'bg-red-500'
                    : creditUtilization > 80
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(creditUtilization, 100)}%` }}
              />
            </View>
            <Text className="text-sm text-gray-500 ">
              Available: ₱{Math.max(0, debtor.credit_limit - debtor.balance).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Products Section */}
        <View className="mx-6 mb-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">Products</Text>
            <TouchableOpacity
              onPress={() => setShowAddProductModal(true)}
              className="flex-row items-center rounded-xl bg-purple-600 px-4 py-2">
              <Plus size={16} color="white" />
              <Text className="ml-2 font-medium text-white">Add Product</Text>
            </TouchableOpacity>
          </View>

          {debtorProducts.length === 0 ? (
            <View className="items-center rounded-2xl bg-white p-8 shadow-lg ">
              <Package size={48} color="#9CA3AF" />
              <Text className="mb-2 mt-4 text-center text-gray-500 ">No products assigned</Text>
              <Text className="text-center text-sm text-gray-400 ">
                Add products to track debtor purchases
              </Text>
            </View>
          ) : (
            <View className="space-y-3 gap-4">
              {debtorProducts.slice(0, 5).map((product) => (
                <View key={product.id} className="rounded-2xl bg-white p-4 gap-4 shadow-lg ">
                  <View className="flex-row items-center justify-between gap-4">
                    <View className="flex-1 flex-row items-center">
                      <LinearGradient
                        colors={['#8B5CF6', '#A855F7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="mr-4 h-12 w-12 items-center justify-center rounded-xl">
                        <ShoppingCart size={20} color="white" />
                      </LinearGradient>
                      <View className="flex-1">
                        <Text className="font-medium text-gray-900 ">
                          {product.products?.product_name || product.product_name || 'Product'}
                        </Text>
                        <Text className="text-sm text-gray-500 ">
                          Qty: {product.quantity} •{' '}
                          {new Date(product.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-lg font-bold text-purple-600">
                      ₱{product.total_price.toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Recent Activity */}
        <View className="mx-6 mb-8">
          <Text className="mb-4 text-xl font-bold text-gray-900 ">Recent Activity</Text>

          {debtorProducts.length === 0 ? (
            <View className="items-center rounded-2xl bg-white p-8 shadow-lg ">
              <Clock size={48} color="#9CA3AF" />
              <Text className="mt-4 text-center text-gray-500 ">No activity found</Text>
            </View>
          ) : (
            <View className="space-y-3 gap-4">
              {debtorProducts.slice(0, 10).map((activity) => (
                <View
                  key={activity.id}
                  className="flex-row items-center rounded-2xl bg-white p-4 shadow-lg ">
                  <LinearGradient
                    colors={['#EF4444', '#F87171']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="mr-4 h-12 w-12 items-center justify-center rounded-xl">
                    <AlertCircle size={20} color="white" />
                  </LinearGradient>

                  <View className="flex-1">
                    <Text className="font-medium text-gray-900 ">
                      Product Purchase:{' '}
                      {activity.products?.product_name || activity.product_name || 'Product'}
                    </Text>
                    <Text className="text-sm text-gray-500 ">
                      Qty: {activity.quantity} •{' '}
                      {new Date(activity.created_at).toLocaleDateString()}
                    </Text>
                  </View>

                  <Text className="text-lg font-bold text-red-500">
                    +₱{activity.total_price.toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Settle Payment Modal */}
      <Modal
        visible={showSettleModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettleModal(false)}>
        <View className="flex-1 bg-slate-900">
          <View className="flex-row items-center justify-between border-b border-slate-700 p-6">
            <Text className="text-xl font-bold text-white">Settle Payment</Text>
            <TouchableOpacity onPress={() => setShowSettleModal(false)}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-6">
            {/* Current Balance */}
            <View className="mb-6 rounded-xl border border-purple-500/30 bg-purple-900/30 p-6">
              <Text className="mb-2 font-medium text-slate-300">Current Balance</Text>
              <Text className="text-3xl font-bold text-white">
                ₱{debtor?.balance?.toLocaleString() ?? '0'}
              </Text>
              <Text className="mt-1 text-sm text-purple-400">Outstanding amount to be settled</Text>
            </View>

            {/* Payment Amount */}
            <View className="mb-6">
              <Text className="mb-3 font-medium text-slate-300">Payment Amount</Text>
              <TextInput
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                keyboardType="numeric"
                placeholder={`Max: ₱${debtor?.balance?.toLocaleString() ?? '0'}`}
                placeholderTextColor="#64748B"
                className="rounded-xl border border-slate-600 bg-slate-800/50 p-4 text-lg text-white"
              />

              {/* Quick Amount Buttons */}
              <View className="mt-3 flex-row gap-2 space-x-2">
                <TouchableOpacity
                  onPress={() => setPaymentAmount((debtor.balance * 0.25).toString())}
                  className="flex-1 items-center rounded-lg bg-slate-700 p-3">
                  <Text className="text-sm text-slate-300">25%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPaymentAmount((debtor.balance * 0.5).toString())}
                  className="flex-1 items-center rounded-lg bg-slate-700 p-3">
                  <Text className="text-sm text-slate-300">50%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPaymentAmount((debtor.balance * 0.75).toString())}
                  className="flex-1 items-center rounded-lg bg-slate-700 p-3">
                  <Text className="text-sm text-slate-300">75%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPaymentAmount(debtor.balance.toString())}
                  className="flex-1 items-center rounded-lg bg-purple-600 p-3">
                  <Text className="text-sm font-medium text-white">Full</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Payment Method */}
            <View className="mb-6">
              <Text className="mb-3 font-medium text-slate-300">Payment Method</Text>
              <View className="flex-row gap-2 space-x-3">
                <TouchableOpacity
                  onPress={() => setPaymentMethod('cash')}
                  className={`flex-1 rounded-xl border-2 p-4 ${
                    paymentMethod === 'cash'
                      ? 'border-green-500 bg-green-600/20'
                      : 'border-slate-600 bg-slate-800/50'
                  }`}>
                  <Text
                    className={`text-center font-medium ${
                      paymentMethod === 'cash' ? 'text-green-400' : 'text-slate-300'
                    }`}>
                    Cash
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled
                  onPress={() => setPaymentMethod('gcash')}
                  className={`flex-1 rounded-xl border-2 p-4 ${
                    paymentMethod === 'gcash'
                      ? 'border-blue-500 bg-blue-600/20'
                      : 'border-slate-600 bg-slate-800/50'
                  }`}>
                  <Text
                    className={`text-center font-medium ${
                      paymentMethod === 'gcash' ? 'text-blue-400' : 'text-slate-300'
                    }`}>
                    GCash
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Payment Summary */}
            {paymentAmount && Number.parseFloat(paymentAmount) > 0 && (
              <View className="mb-6 rounded-xl border border-slate-600 bg-slate-800/50 p-4">
                <Text className="mb-3 font-medium text-slate-300">Payment Summary</Text>
                <View className="mb-2 flex-row justify-between">
                  <Text className="text-slate-400">Payment Amount:</Text>
                  <Text className="text-white">
                    ₱{Number.parseFloat(paymentAmount).toLocaleString()}
                  </Text>
                </View>
                <View className="mb-2 flex-row justify-between">
                  <Text className="text-slate-400">Payment Method:</Text>
                  <Text className="capitalize text-white">{paymentMethod}</Text>
                </View>
                <View className="flex-row justify-between border-t border-slate-600 pt-2">
                  <Text className="font-medium text-white">Remaining Balance:</Text>
                  <Text className="font-bold text-purple-400">
                    ₱{(debtor.balance - Number.parseFloat(paymentAmount)).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-2 space-x-3">
              <TouchableOpacity
                onPress={() => setShowSettleModal(false)}
                className="flex-1 items-center rounded-xl bg-slate-700 p-4">
                <Text className="font-medium text-slate-300">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSettlePayment}
                disabled={!paymentAmount || Number.parseFloat(paymentAmount) <= 0 || settleLoading}
                className={`flex-1 items-center rounded-xl p-4 ${
                  !paymentAmount || Number.parseFloat(paymentAmount) <= 0 || settleLoading
                    ? 'bg-slate-700'
                    : 'bg-purple-600'
                }`}>
                <Text
                  className={`font-medium ${
                    !paymentAmount || Number.parseFloat(paymentAmount) <= 0 || settleLoading
                      ? 'text-slate-500'
                      : 'text-white'
                  }`}>
                  {settleLoading ? 'Processing...' : 'Process Payment'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Add Product Modal */}
      <Modal
        visible={showAddProductModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddProductModal(false)}>
        <View className="flex-1 bg-slate-900">
          <View className="flex-row items-center justify-between border-b border-slate-700 p-6">
            <Text className="text-xl font-bold text-white">Add Product</Text>
            <TouchableOpacity onPress={() => setShowAddProductModal(false)}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-6">
            {/* Product Selection */}
            <View className="mb-6 gap-2">
              <Text className="mb-3 font-medium text-slate-300">Select Product</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2 space-x-3">
                {inventoryItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setSelectedInventoryId(item.id)}
                    className={`min-w-[200px] rounded-xl border-2 p-4 ${
                      selectedInventoryId === item.id
                        ? 'border-purple-500 bg-purple-600/20'
                        : 'border-slate-600 bg-slate-800/50'
                    }`}>
                    <Text className="font-medium text-white">{item.name}</Text>
                    <Text className="text-sm text-slate-400">Stock: {item.stock}</Text>
                    <Text className="font-semibold text-purple-400">
                      ₱{item.srp?.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {selectedInventory && (
              <>
                {/* Quantity Input */}
                <View className="mb-6">
                  <Text className="mb-3 font-medium text-slate-300">Quantity</Text>
                  <TextInput
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    placeholder={`Max: ${selectedInventory.stock}`}
                    placeholderTextColor="#64748B"
                    className="rounded-xl border border-slate-600 bg-slate-800/50 p-4 text-white"
                  />
                </View>

                {/* Custom Price Option */}
                <View className="mb-6">
                  <TouchableOpacity
                    onPress={() => setUseCustomPrice(!useCustomPrice)}
                    className="mb-3 flex-row items-center">
                    <View
                      className={`mr-3 h-5 w-5 rounded border-2 ${
                        useCustomPrice ? 'border-purple-600 bg-purple-600' : 'border-slate-600'
                      }`}>
                      {useCustomPrice && <CheckCircle size={12} color="white" />}
                    </View>
                    <Text className="text-slate-300">Use custom price</Text>
                  </TouchableOpacity>

                  {useCustomPrice && (
                    <TextInput
                      value={customPrice}
                      onChangeText={setCustomPrice}
                      keyboardType="numeric"
                      placeholder="Enter custom price"
                      placeholderTextColor="#64748B"
                      className="rounded-xl border border-slate-600 bg-slate-800/50 p-4 text-white"
                    />
                  )}
                </View>

                {/* Price Summary */}
                <View className="mb-6 rounded-xl border border-purple-500/30 bg-purple-900/30 p-4">
                  <Text className="mb-2 font-medium text-slate-300">Price Summary</Text>
                  <View className="mb-1 flex-row justify-between">
                    <Text className="text-slate-400">Unit Price:</Text>
                    <Text className="text-white">
                      ₱
                      {(useCustomPrice
                        ? Number.parseFloat(customPrice) || 0
                        : (selectedInventory.srp ?? 0)
                      ).toLocaleString()}
                    </Text>
                  </View>
                  <View className="mb-1 flex-row justify-between">
                    <Text className="text-slate-400">Quantity:</Text>
                    <Text className="text-white">{quantity}</Text>
                  </View>
                  <View className="flex-row justify-between border-t border-slate-600 pt-2">
                    <Text className="font-medium text-white">Total:</Text>
                    <Text className="text-lg font-bold text-purple-400">
                      ₱
                      {(
                        (useCustomPrice
                          ? Number.parseFloat(customPrice) || 0
                          : (selectedInventory?.srp ?? 0)) * Number.parseInt(quantity || '0')
                      ).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-4 space-x-3">
              <TouchableOpacity
                onPress={() => setShowAddProductModal(false)}
                className="flex-1 items-center rounded-xl bg-slate-700 p-4">
                <Text className="font-medium text-slate-300">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddProduct}
                disabled={!selectedInventoryId || loading}
                className={`flex-1 items-center rounded-xl p-4 ${
                  !selectedInventoryId || loading ? 'bg-slate-700' : 'bg-purple-600'
                }`}>
                <Text
                  className={`font-medium ${!selectedInventoryId || loading ? 'text-slate-500' : 'text-white'}`}>
                  {loading ? 'Adding...' : 'Add Product'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
