import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button, ControlledInput, Text, View } from '@/ui';

const phoneSchema = z.object({
  phone: z
    .string({
      required_error: 'Phone number is required',
    })
    .min(10, 'Phone number must be at least 10 characters')
    .max(15, 'Phone number must be at most 15 characters')
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Phone number must be a valid international phone number'
    ),
});

export type PhoneFormType = z.infer<typeof phoneSchema>;

export type PhoneNumberFormProps = {
  onNext: (data: PhoneFormType) => void;
};

export const PhoneNumberForm = ({ onNext }: PhoneNumberFormProps) => {
  const [loading, setLoading] = useState(false);

  const { handleSubmit, control } = useForm<PhoneFormType>({
    resolver: zodResolver(phoneSchema),
  });

  const handleNext = async (data: PhoneFormType) => {
    setLoading(true);
    try {
      onNext(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-4">
      <Text testID="form-title" className="pb-6 text-center text-2xl">
        Sign In
      </Text>

      <ControlledInput
        testID="phone"
        control={control}
        name="phone"
        label="Phone"
      />
      <Button
        testID="next-button"
        label={loading ? 'Loading...' : 'Next'}
        size="lg"
        onPress={handleSubmit(handleNext)}
        loading={loading}
      />
    </View>
  );
};
