import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '~/lib/auth';
import { Alert } from 'react-native';

interface SettlementParams {
  debtorId: string;
  paymentAmount: number;
  paymentMethod: 'cash' | 'gcash' | 'bank_transfer';
  customerName: string;
  profileId?: number | null;
}

interface SettlementResult {
  success: boolean;
  order_id: number;
  total: number;
  error?: string;
  items_count: number;
  settlement_date: string;
  remaining_balance: number;
}

export const useSettleDebtor = () => {
  const queryClient = useQueryClient();

  return useMutation<SettlementResult, Error, SettlementParams>({
    mutationFn: async ({
      debtorId,
      paymentAmount,
      paymentMethod,
      customerName,
      profileId,
    }) => {
      // Validate payment amount
      if (!paymentAmount || paymentAmount <= 0) {
        throw new Error('Payment amount must be greater than zero');
      }

      try {
        // Call the settlement RPC function
        const { data, error } = await supabase.rpc('settle_debtor_payment', {
          p_debtor_id: debtorId,
          p_payment_method: paymentMethod,
          p_customer_name: customerName,
          p_profile_id: profileId,
          p_partial_amount: paymentAmount,
        });

        if (error) {
          console.error('Settlement RPC Error:', error);
          throw new Error(error.message || 'Failed to process settlement');
        }

        // Extract and validate the result
        const result = data?.[0];
        if (!result?.success) {
          throw new Error(result?.error || 'Settlement failed');
        }

        return result;
      } catch (error) {
        throw error instanceof Error 
          ? error 
          : new Error('An unexpected error occurred');
      }
    },

    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      const queries = [
        ['debtor', variables.debtorId],
        ['debtors'],
        ['debtor-products', variables.debtorId],
        ['orders'],
        ['transactions']
      ];

      queries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    },

    onError: (error) => {
      Alert.alert(
        'Settlement Error',
        error.message || 'Failed to process payment'
      );
    }
  });
};