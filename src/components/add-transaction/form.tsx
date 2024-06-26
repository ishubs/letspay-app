import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as z from 'zod';

const transactionSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Amount must be a number greater than 0')
    .refine((value) => parseFloat(value) > 0, 'Amount must be greater than 0'),
  description: z.string().min(3, 'Description is required'),
});

type TransactionFormType = z.infer<typeof transactionSchema>;

type TransactionFormProps = {
  onSubmit: (data: TransactionFormType) => void;
};

// eslint-disable-next-line max-lines-per-function
export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TransactionFormType>({
    resolver: zodResolver(transactionSchema),
  });

  return (
    <View className="h-full flex-1 justify-between">
      <View className="flex flex-col gap-4">
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className="h-[44px] rounded-lg border border-gray-300 pl-2 pr-8 text-center"
              placeholder="Enter amount"
              keyboardType="numeric"
              autoFocus={true}
            />
          )}
        />
        {errors.amount && (
          <Text className="mt-1 text-center text-red-500">
            {errors.amount.message}
          </Text>
        )}

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className="h-[44px] rounded-lg border border-gray-300 pl-2 pr-8"
              placeholder="Enter description"
            />
          )}
        />
        {errors.description && (
          <Text className="mt-1 text-center text-red-500">
            {errors.description.message}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={handleSubmit((data) => {
          setLoading(true);
          onSubmit(data);
          setLoading(false);
        })}
        className="mt-4 rounded-lg bg-blue-500 p-3"
        disabled={loading}
      >
        <Text className="text-center text-white">
          {loading ? 'Loading...' : 'Submit'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
