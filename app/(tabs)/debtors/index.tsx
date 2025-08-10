import { View, ScrollView, RefreshControl } from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router';
import { User, CheckCircle, DollarSign, Plus } from "lucide-react-native";
import { Text } from '~/components/nativewindui/Text';
import { useGetDebtors } from '~/hooks/debtor';
import { useGetTransactions } from '~/hooks/transaction';
import { useColorScheme } from '~/lib/useColorScheme';
import { Button } from '~/components/nativewindui/Button';
import { ProgressIndicator } from '~/components/nativewindui/ProgressIndicator';
import type { Debtor } from '~/types/database';

export default function DebtorsScreen() {
  const { colors } = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);
  const { data: debtors, refetch } = useGetDebtors();
  const { data: transactions } = useGetTransactions();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const totalDebt = debtors?.reduce((acc, debtor) => acc + debtor.balance, 0) || 0;
  const activeDebtors = debtors?.filter(debtor => !debtor.is_settled) || [];
  const settledDebtors = debtors?.filter(debtor => debtor.is_settled) || [];

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4 space-y-6">
          {/* Debt Statistics */}
          <View className="flex-row gap-4">
            <DebtorStatCard
               icon={User}
              label="Active"
              value={activeDebtors.length.toString()}
              variant="warning"
            />
            <DebtorStatCard
           icon={CheckCircle}
              label="Settled"
              value={settledDebtors.length.toString()}
              variant="default"
            />
            <DebtorStatCard
             icon={DollarSign}
              label="Total Debt"
              value={`₱${totalDebt.toFixed(2)}`}
              variant="danger"
            />
          </View>

          {/* Quick Actions */}
          <View className="flex-row justify-between items-center">
            <Text variant="title3">Debtors</Text>
            <Link href={"/debtors/add" as any} asChild>
              <Button variant="primary" size="sm">
                <Plus size={16} color="white" />
                <Text className="text-white">Add Debtor</Text>
              </Button>
            </Link>
          </View>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              <FilterChip label="All" active />
              <FilterChip label="Active" />
              <FilterChip label="Due Soon" />
              <FilterChip label="Overdue" />
              <FilterChip label="Settled" />
            </View>
          </ScrollView>

          {/* Debtors List */}
          <View className="space-y-4">
            {debtors?.map((debtor) => {
              const slug = debtor.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              return (
                <Link key={debtor.id} href={`/debtors/${debtor.id}/${slug}`} asChild>
                  <DebtorCard debtor={debtor} />
                </Link>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function DebtorStatCard({ 
  icon: IconComponent,
  label, 
  value, 
  variant = 'default' 
}: { 
 icon: React.ElementType;
  label: string; 
  value: string; 
  variant?: 'default' | 'warning' | 'danger';
}) {
  const { colors } = useColorScheme();
  
  const variantColors = {
    default: colors.primary,
    warning: '#f59e0b',
    danger: '#ef4444'
  };

  return (
    <View className="flex-1 bg-card p-4 rounded-xl space-y-2">
      <View 
        style={{ backgroundColor: `${variantColors[variant]}20` }}
        className="w-8 h-8 rounded-full items-center justify-center"
      >
       <IconComponent size={16} color={variantColors[variant]} />
      </View>
      <View>
        <Text variant="title3">{value}</Text>
        <Text variant="footnote" color="tertiary">{label}</Text>
      </View>
    </View>
  );
}

function FilterChip({ label, active = false }: { label: string; active?: boolean }) {
  const { colors } = useColorScheme();

  return (
    <View
      className={`px-4 py-2 rounded-full ${
        active ? 'bg-primary' : 'bg-card'
      }`}
    >
      <Text
        className={active ? 'text-white' : ''}
        color={active ? 'primary' : 'tertiary'}
      >
        {label}
      </Text>
    </View>
  );
}

function DebtorCard({ debtor }: { debtor: Debtor }) {
  const { colors } = useColorScheme();

  const statusColors = {
    active: colors.primary,
    'due-soon': '#f59e0b',
    overdue: '#ef4444',
    settled: '#10b981'
  } as const;
const statusColor =
  statusColors[debtor.status as keyof typeof statusColors] ?? colors.primary;
  const progress = (debtor.balance / debtor.credit_limit) * 100;
const lastPaymentDate = debtor.payment_history?.length
  ? new Date(
      debtor.payment_history
        .map((p: { date: string }) => new Date(p.date))
        .sort((a, b) => b.getTime() - a.getTime())[0]
    ).toLocaleDateString()
  : 'No payments yet';
  return (
    <View className="bg-card p-4 rounded-xl space-y-3">
      <View className="flex-row items-center justify-between">
        <Text variant="heading">{debtor.name}</Text>
        <View 
        style={{ backgroundColor: statusColor + '20' }}
          className="py-1 px-3 rounded-full flex-row items-center gap-1"
        >
          <Text style={{ color: statusColor }}>
            {debtor.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Text>
        </View>
      </View>
      
      <View className="space-y-2">
        <View className="flex-row justify-between">
          <Text color="tertiary">Balance</Text>
          <Text variant="heading">₱{debtor.balance.toFixed(2)}</Text>
        </View>
        
        <View className="space-y-1">
          <View className="flex-row justify-between">
            <Text variant="caption1" color="tertiary">Credit Limit</Text>
            <Text variant="caption1" color="tertiary">
              ₱{debtor.balance.toFixed(2)} / ₱{debtor.credit_limit.toFixed(2)}
            </Text>
          </View>
          
          <ProgressIndicator
            className="h-2 bg-muted rounded-full overflow-hidden"
            value={progress}
            max={100}
          />
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <Text variant="footnote" color="tertiary">
          Last payment: {lastPaymentDate}
        </Text>
        <Button variant="secondary" size="sm">
          <Text>Record Payment</Text>
          <DollarSign  size={16} color={colors.primary} />
        </Button>
      </View>
    </View>
  );
}
