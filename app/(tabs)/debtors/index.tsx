import { View, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { Link } from 'expo-router';
import {
  User,
  CheckCircle,
  Plus,
  TrendingUp,
  AlertTriangle,
  Calendar,
  UserPlus,
  Search,
  RefreshCw,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '~/components/nativewindui/Text';
import { useDeleteDebtor, useGetDebtors } from '~/hooks/debtor';

import type { Debtor } from '~/types/database';
import { Button } from '~/components/nativewindui/Button';
import { FilterChip } from '~/components/filter-chip';

function LoadingState() {
  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['#8B5CF6', '#A855F7', '#C084FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-8 pt-16">
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">Debtors</Text>
            <Text className="text-base text-white/80">Loading customer data...</Text>
          </View>
        </View>
      </LinearGradient>

      <View className="flex-1 items-center justify-center px-6">
        <RefreshCw size={48} color="#8B5CF6" className="mb-4 animate-spin" />
        <Text className="mb-2 text-lg font-semibold text-foreground">Loading Debtors</Text>
        <Text className="text-center text-muted-foreground">
          Please wait while we fetch your customer data
        </Text>
      </View>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['#8B5CF6', '#A855F7', '#C084FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-8 pt-16">
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">Debtors</Text>
            <Text className="text-base text-white/80">Unable to load data</Text>
          </View>
        </View>
      </LinearGradient>

      <View className="flex-1 items-center justify-center px-6">
        <AlertTriangle size={48} color="#EF4444" className="mb-4" />
        <Text className="mb-2 text-lg font-semibold text-foreground">Something went wrong</Text>
        <Text className="mb-6 text-center text-muted-foreground">
          We {`couldn't`} load your debtors data. Please check your connection and try again.
        </Text>
        <TouchableOpacity onPress={onRetry}>
          <LinearGradient
            colors={['#8B5CF6', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center gap-2 rounded-full px-6 py-3">
            <RefreshCw size={16} color="white" />
            <Text className="font-medium text-white">Try Again</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['#8B5CF6', '#A855F7', '#C084FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-8 pt-16">
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">Debtors</Text>
            <Text className="text-base text-white/80">No customers yet</Text>
          </View>
          <Link href={'/debtors/add' as any} asChild>
            <TouchableOpacity className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
              <Plus size={24} color="white" />
            </TouchableOpacity>
          </Link>
        </View>
      </LinearGradient>

      <View className="flex-1 items-center justify-center px-6">
        <UserPlus size={64} color="#8B5CF6" className="mb-6" />
        <Text className="mb-3 text-xl font-bold text-foreground">No Debtors Yet</Text>
        <Text className="mb-8 text-center leading-6 text-muted-foreground">
          Start managing customer credit by adding your first debtor. Track balances, payment
          history, and credit limits all in one place.
        </Text>
        <Link href={'/debtors/add' as any} asChild>
          <TouchableOpacity>
            <LinearGradient
              colors={['#8B5CF6', '#A855F7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex-row items-center gap-3 rounded-full px-8 py-4">
              <UserPlus size={20} color="white" />
              <Text className="text-lg font-semibold text-white">Add First Debtor</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

function NoFilteredResults({
  activeFilter,
  onClearFilter,
}: {
  activeFilter: string;
  onClearFilter: () => void;
}) {
  return (
    <View className="items-center py-12">
      <Search size={48} color="#6B7280" className="mb-4" />
      <Text className="mb-2 text-lg font-semibold text-black">No Results Found</Text>
      <Text className="mb-6 text-center text-gray-50">
        No debtors match the {`"${activeFilter}"`} filter. Try adjusting your search criteria.
      </Text>
      <TouchableOpacity onPress={onClearFilter}>
        <View className="rounded-full border border-border bg-card px-6 py-3">
          <Text className="font-medium text-foreground">Show All Debtors</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function DebtorsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const { data: debtors, refetch, isLoading, error } = useGetDebtors();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const totalDebt = debtors?.reduce((acc, debtor) => acc + debtor.balance, 0) || 0;
  const activeDebtors = debtors?.filter((debtor) => !debtor.is_settled) || [];
  const settledDebtors = debtors?.filter((debtor) => debtor.is_settled) || [];
  const overdueDebtors = debtors?.filter((debtor) => debtor.status === 'overdue') || [];

  const filteredDebtors =
    debtors?.filter((debtor) => {
      switch (activeFilter) {
        case 'Active':
          return !debtor.is_settled;
        case 'Due Soon':
          return debtor.status === 'due-soon';
        case 'Overdue':
          return debtor.status === 'overdue';
        case 'Settled':
          return debtor.is_settled;
        default:
          return true;
      }
    }) || [];

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  if (!debtors || debtors.length === 0) {
    return <EmptyState />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Gradient Header */}
      <LinearGradient
        colors={['#8B5CF6', '#A855F7', '#C084FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-8 pt-16">
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-white">Debtors</Text>
            <Text className="text-base text-white/80">Manage customer credit</Text>
          </View>
          <Link href={'/debtors/add' as any} asChild>
            <TouchableOpacity className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
              <Plus size={24} color="white" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Revenue Summary */}
        <View className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
          <View className="mb-2 flex-row items-center gap-2">
            <TrendingUp size={20} color="white" />
            <Text className="font-semibold text-white">Total Outstanding</Text>
          </View>
          <Text className="text-3xl font-bold text-white">₱{totalDebt.toLocaleString()}</Text>
          <Text className="text-sm text-white/80">{activeDebtors.length} active accounts</Text>
        </View>
      </LinearGradient>

      <ScrollView
        className="-mt-4 flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="gap-4 space-y-6 rounded-t-3xl bg-gray-50 px-6 pt-6">
          {/* Statistics Cards */}
          <View className="flex-row gap-3">
            {/* Active */}
            <View className="flex-1 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <View className="items-center space-y-1">
                <User size={20} color="#3b82f6" />
                <Text className="text-2xl font-bold text-blue-600">
                  {activeDebtors.length.toString()}
                </Text>
                <Text className="text-xs font-medium text-blue-600">Active</Text>
              </View>
            </View>

            {/* Overdue */}
            <View className="flex-1 rounded-2xl border border-red-100 bg-red-50 p-4">
              <View className="items-center space-y-1">
                <AlertTriangle size={20} color="#ef4444" />
                <Text className="text-2xl font-bold text-red-600">
                  {overdueDebtors.length.toString()}
                </Text>
                <Text className="text-xs font-medium text-red-600">Overdue</Text>
              </View>
            </View>

            {/* Settled */}
            <View className="flex-1 rounded-2xl border border-green-100 bg-green-50 p-4">
              <View className="items-center space-y-1">
                <CheckCircle size={20} color="#10b981" />
                <Text className="text-2xl font-bold text-green-600">
                  {settledDebtors.length.toString()}
                </Text>
                <Text className="text-xs font-medium text-green-600">Settled</Text>
              </View>
            </View>
          </View>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {['All', 'Active', 'Due Soon', 'Overdue', 'Settled'].map((filter) => (
                <FilterChip
                  key={filter}
                  label={filter}
                  isSelected={activeFilter === filter}
                  onPress={() => setActiveFilter(filter)}
                />
              ))}
            </View>
          </ScrollView>

          {/* Debtors List */}
          <View className="gap-4 space-y-4 pb-6">
            {filteredDebtors.length === 0 ? (
              <NoFilteredResults
                activeFilter={activeFilter}
                onClearFilter={() => setActiveFilter('All')}
              />
            ) : (
              filteredDebtors.map((debtor) => {
                return (
                  <React.Fragment key={debtor.id}>
                    <DebtorCard debtor={debtor} />
                  </React.Fragment>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function DebtorCard({ debtor }: { debtor: Debtor }) {
  const deleteDebtor = useDeleteDebtor();

  const handleDelete = () => {
    Alert.alert(
      'Delete Debtor',
      `Are you sure you want to delete ${debtor.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteDebtor.mutate(debtor.id as string),
        },
      ]
    );
  };

  const statusColors = {
    active: ['#3B82F6', '#60A5FA'],
    'due-soon': ['#FBBF24', '#FCD34D'],
    overdue: ['#F87171', '#FCA5A5'],
    settled: ['#34D399', '#6EE7B7'],
  } as const;

  const statusGradient = statusColors[debtor.status as keyof typeof statusColors] ?? [
    '#D1D5DB',
    '#9CA3AF',
  ];

  const progress = Math.min((debtor.balance / debtor.credit_limit) * 100, 100);

  const lastPaymentDate = debtor.payment_history?.length
    ? new Date(
        debtor.payment_history
          .map((p: { date: string }) => new Date(p.date))
          .sort((a, b) => b.getTime() - a.getTime())[0]
      ).toLocaleDateString()
    : 'No payments yet';

  return (
    <View
      className="space-y-4 rounded-2xl bg-white p-5"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}>
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900">{debtor.name}</Text>
          <Text className="text-sm text-gray-500">Unique Code: {debtor.unique_code}</Text>
        </View>
        <LinearGradient
          colors={statusGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="rounded-full px-3 py-1">
          <Text className="text-xs font-medium text-white">
            {debtor.status
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </Text>
        </LinearGradient>
      </View>

      {/* Balance Info */}
      <View className="space-y-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-500">Outstanding Balance</Text>
          <Text className="text-xl font-bold text-gray-900">
            ₱{debtor.balance.toLocaleString()}
          </Text>
        </View>

        {/* Credit Limit Progress */}
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Credit Utilization</Text>
            <Text className="text-sm text-gray-900">
              {progress.toFixed(1)}% of ₱{debtor.credit_limit.toLocaleString()}
            </Text>
          </View>

          <View className="h-2 overflow-hidden rounded-full bg-gray-200">
            <LinearGradient
              colors={progress > 80 ? ['#F87171', '#FCA5A5'] : ['#A78BFA', '#C4B5FD']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-full rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>
      </View>

      {/* Footer */}
      <View className="flex-col items-center justify-between gap-4 border-t border-gray-200 pt-2">
        <View className="flex-row items-center gap-2">
          <Calendar size={14} color="#9CA3AF" />
          <Text className="text-sm text-gray-500">Last payment: {lastPaymentDate}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Link href={`/debtors/${debtor.id}`} asChild>
            <Button variant="black">
              <Text className="text-sm font-medium ">View Details</Text>
            </Button>
          </Link>
          <Button variant="danger" onPress={handleDelete}>
            <AlertTriangle size={14} color="white" />
            <Text className="text-sm font-medium text-white">Delete</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
