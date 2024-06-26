import { zodResolver } from '@hookform/resolvers/zod';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button, ControlledInput, Text, View } from '@/ui'; // Assuming you have these components in your UI library

const onboardingSchema = z.object({
  firstname: z
    .string({
      required_error: 'First name is required',
    })
    .min(2, 'First name must be at least 2 characters long'),
  lastname: z
    .string({
      required_error: 'Last name is required',
    })
    .min(2, 'Last name must be at least 2 characters long'),
});

export type OnboardingFormType = z.infer<typeof onboardingSchema>;

export type OnboardingFormProps = {
  onComplete: (data: OnboardingFormType) => void;
};

export default function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { handleSubmit, control } = useForm<OnboardingFormType>({
    resolver: zodResolver(onboardingSchema),
  });

  const handleComplete = async (data: OnboardingFormType) => {
    setLoading(true);
    try {
      const user = auth().currentUser;
      console.log(data, 'data');
      if (user) {
        await firestore().collection('users').doc(user.uid).update({
          firstName: data.firstname,
          lastName: data.lastname,
          status: 'complete',
        });
      }
      router.push('/');
      // await onComplete(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-4">
      <Text testID="form-title" className="pb-6 text-center text-2xl">
        Complete Your Onboarding
      </Text>
      <ControlledInput
        testID="firstname"
        control={control}
        name="firstname"
        label="First Name"
      />
      <ControlledInput
        testID="lastname"
        control={control}
        name="lastname"
        label="Last Name"
      />
      <Button
        testID="complete-button"
        label={loading ? 'Loading...' : 'Complete'}
        size="lg"
        onPress={handleSubmit(handleComplete)}
        disabled={loading}
      />
    </View>
  );
}
