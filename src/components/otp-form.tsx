import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button, ControlledInput, Text, View } from '@/ui';

const otpSchema = z.object({
  otp: z
    .string({
      required_error: 'OTP is required',
    })
    .length(6, 'OTP must be 6 characters long'),
});

export type OTPFormType = z.infer<typeof otpSchema>;

export type OTPFormProps = {
  onVerify: (data: OTPFormType) => void;
  onBack: () => void;
};

export const OTPForm = ({ onVerify, onBack }: OTPFormProps) => {
  const [loading, setLoading] = useState(false);

  const { handleSubmit, control } = useForm<OTPFormType>({
    resolver: zodResolver(otpSchema),
  });

  const handleVerify = async (data: OTPFormType) => {
    setLoading(true);
    try {
      onVerify(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-4">
      <Text testID="form-title" className="pb-6 text-center text-2xl">
        Verify OTP
      </Text>
      <ControlledInput testID="otp" control={control} name="otp" label="OTP" />
      <Button
        testID="verify-button"
        label={loading ? 'Verifying...' : 'Verify OTP'}
        size="lg"
        onPress={handleSubmit(handleVerify)}
        loading={loading}
      />
      <Button testID="back-button" label="Back" size="lg" onPress={onBack} />
    </View>
  );
};
