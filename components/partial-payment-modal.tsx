import React, { useState, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useSettleDebtor } from "~/hooks/debtor-payment";
import { Debtor } from "~/types/database";
import { supabase } from "~/lib/auth";


export const PartialPaymentModal = ({
  visible,
  onClose,
  debtorId,
  totalDebt,
    debtor,
      onPartialPayment,
}: {
visible: boolean;
  onClose: () => void;
  debtorId: string;
  debtor: Debtor;
  totalDebt: number;
  onPartialPayment: (amount: number) => Promise<void>;
  
}) => {
  const [amount, setAmount] = useState("");
  const queryClient = useQueryClient();
  const { mutateAsync: settleDebtor } = useSettleDebtor();

  const amountNum = parseFloat(amount) || 0;
  const quickAmounts = useMemo(
    () => [0.25, 0.5, 0.75, 1].map((p) => totalDebt * p),
    [totalDebt]
  );

  const handleQuickSelect = (value: number) => {
    setAmount(value.toFixed(2));
  };

const handleSubmit = async () => {
  if (amountNum <= 0) {
    Alert.alert("Invalid Amount", "Please enter a positive amount.");
    return;
  }
  if (amountNum > totalDebt) {
    Alert.alert("Invalid Amount", "Payment cannot exceed total debt.");
    return;
  }

  try {
    await settleDebtor({
      debtorId,
      paymentAmount: amountNum,
      paymentMethod: "cash",
      customerName: debtor.name,
      profileId: null,
    });

    if (amountNum === totalDebt) {
   
      await supabase
        .from("debtors")
        .update({ is_settled: true })
        .eq("id", debtorId);
    }

    await queryClient.invalidateQueries({ queryKey: ["debtor", debtorId] });
    await queryClient.invalidateQueries({ queryKey: ["debtors"] });

    await onPartialPayment(amountNum);

    Alert.alert("Success", "Partial payment processed.");
    onClose();
  } catch (error) {
    Alert.alert("Error", "Failed to process payment.");
  }
};


  return (
    <Modal transparent visible={visible} animationType="slide">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="bg-white p-5 rounded-lg w-4/5">
          <Text className="text-lg font-bold mb-2">Partial Payment</Text>
          <Text className="mb-2">Total Debt: ₱{totalDebt.toFixed(2)}</Text>

          <TextInput
            className="border border-gray-300 rounded px-3 py-2 mb-3"
            keyboardType="numeric"
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
          />

          <View className="flex-row justify-between mb-3">
            {quickAmounts.map((amt, idx) => (
              <TouchableOpacity
                key={idx}
                className="bg-gray-200 px-3 py-2 rounded"
                onPress={() => handleQuickSelect(amt)}
              >
                <Text>{amt.toFixed(2)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row justify-end">
            <TouchableOpacity
              className="mr-3 px-4 py-2 bg-gray-300 rounded"
              onPress={onClose}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-4 py-2 bg-green-500 rounded"
              onPress={handleSubmit}
            >
              <Text className="text-white">Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
