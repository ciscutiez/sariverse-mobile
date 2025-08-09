import { View, ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, Link } from 'expo-router';
import { Icon } from '@roninoss/icons';
import { Text } from '~/components/nativewindui/Text';
import { Button } from '~/components/nativewindui/Button';
import { ProgressIndicator } from '~/components/nativewindui/ProgressIndicator';
import { useGetDebtorById } from '~/hooks/debtor';
import { useGetDebtorProducts } from '~/hooks/debtor-product';
import { useGetTransactions } from '~/hooks/transaction';
import { useColorScheme } from '~/lib/useColorScheme';

export default function DebtorDetailsScreen() {
  const { colors } = useColorScheme();
  const { id, slug } = useLocalSearchParams<{ id: string; slug: string }>();
  const [refreshing, setRefreshing] = useState(false);

  const { data: debtor, refetch: refetchDebtor } = useGetDebtorById(id);
  const { data: debtorProducts, refetch: refetchProducts } = useGetDebtorProducts();
  const { data: transactions, refetch: refetchTransactions } = useGetTransactions();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchDebtor(),
      refetchProducts(),
      refetchTransactions()
    ]);
    setRefreshing(false);
  };

  if (!debtor) return null;

  const debtorTransactions = transactions?.filter(t => t.debtor_id === id) || [];
  const currentProducts = debtorProducts?.filter(dp => dp.debtor_id === id) || [];

  return (
    <ScrollView 
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4 space-y-6">
        {/* Header */}
        <View className="space-y-2">
          <Text variant="largeTitle">{debtor.name}</Text>
          <View 
            style={{ backgroundColor: statusColors[debtor.status]+'20' }}
            className="self-start py-1 px-3 rounded-full flex-row items-center gap-1"
          >
            <Text style={{ color: statusColors[debtor.status] }}>
              {debtor.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Text>
          </View>
        </View>

        {/* Credit Status */}
        <View className="bg-card p-4 rounded-xl space-y-4">
          <View className="space-y-2">
            <Text variant="subhead" color="tertiary">Outstanding Balance</Text>
            <Text variant="title1">₱{debtor.balance.toFixed(2)}</Text>
          </View>

          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text variant="footnote" color="tertiary">Credit Limit</Text>
              <Text variant="footnote" color="tertiary">
                ₱{debtor.balance.toFixed(2)} / ₱{debtor.credit_limit.toFixed(2)}
              </Text>
            </View>
            <ProgressIndicator
              className="h-2 bg-muted rounded-full overflow-hidden"
              value={(debtor.balance / debtor.credit_limit) * 100}
              max={100}
            />
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row gap-4">
          <Link href={`/debtors/${id}/${slug}/add-product`} asChild>
            <Button className="flex-1" variant="primary">
              <Icon name="plus" size={16} color="white" />
              <Text className="text-white">Add Product</Text>
            </Button>
          </Link>
          <Link href={`/debtors/${id}/${slug}/edit`} asChild>
            <Button className="flex-1" variant="secondary">
              <Icon name="edit" size={16} color={colors.primary} />
              <Text>Edit Details</Text>
            </Button>
          </Link>
        </View>

        {/* Products */}
        <View className="space-y-4">
          <Text variant="title3">Products</Text>
          <View className="space-y-3">
            {currentProducts.map(product => (
              <View key={product.id} className="bg-card p-4 rounded-xl">
                <View className="flex-row justify-between items-center">
                  <Text variant="heading">{product.name}</Text>
                  <Text variant="heading">₱{product.total_price.toFixed(2)}</Text>
                </View>
                <Text variant="footnote" color="tertiary">Quantity: {product.quantity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Transaction History */}
        <View className="space-y-4">
          <Text variant="title3">Transaction History</Text>
          <View className="space-y-3">
            {debtorTransactions.map(transaction => (
              <View key={transaction.id} className="bg-card p-4 rounded-xl">
                <View className="flex-row justify-between items-center">
                  <View className="space-y-1">
                    <Text variant="heading">₱{transaction.amount.toFixed(2)}</Text>
                    <Text variant="footnote" color="tertiary">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View 
                    className={`py-1 px-3 rounded-full ${
                      transaction.is_settled ? 'bg-green-500/20' : 'bg-yellow-500/20'
                    }`}
                  >
                    <Text 
                      className={transaction.is_settled ? 'text-green-500' : 'text-yellow-500'}
                    >
                      {transaction.is_settled ? 'Settled' : 'Pending'}
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-between mt-2">
                  <Text variant="footnote" color="tertiary">
                    Via {transaction.payment_method.toUpperCase()}
                  </Text>
                  <Text variant="footnote" color="tertiary">
                    Balance: ₱{transaction.remaining_balance.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const statusColors = {
  active: '#10b981',
  'due-soon': '#f59e0b',
  overdue: '#ef4444',
  settled: '#6366f1'
};
