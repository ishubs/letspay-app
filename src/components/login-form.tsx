/* eslint-disable max-lines-per-function */
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useAuth } from '@/core';

import type { OTPFormType } from './otp-form';
import { OTPForm } from './otp-form';
import type { PhoneFormType } from './phone-form';
import { PhoneNumberForm } from './phone-form';

export const LoginForm = ({ onSubmit }: { onSubmit: () => {} }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [confirmation, setConfirmation] = useState(null);
  const router = useRouter();
  const signIn = useAuth.use.signIn();
  const [userExists, setUserExists] = useState<boolean | null>(null);

  async function onAuthStateChanged(user: any) {
    if (user) {
      console.log(user, 'user');
      try {
        signIn({ access: 'access-token', refresh: 'refresh-token' });

        const userDoc = await firestore()
          .collection('users')
          .doc(user.uid)
          .get();
        if (userDoc.exists) {
          setUserExists(true);
          router.push('/');
        } else {
          // User does not exist, create new user document
          const phone = user.phoneNumber; // Assuming phone number is available in user object
          await firestore().collection('users').doc(user.uid).set({
            phone,
            status: 'onboarding',
          });
          setUserExists(false);
          console.log('User created and does not exist');
          router.push('/onboardingform');
        }
      } catch (error) {
        console.error('Error checking user existence: ', error);
        setUserExists(false); // handle the error case by showing onboarding
      }
      // signIn({ access: 'access-token', refresh: 'refresh-token' });
      // router.push('/');
      // Some Android devices can automatically process the verification code (OTP) message, and the user would NOT need to enter the code.
      // Actually, if he/she tries to enter it, he/she will get an error message because the code was already used in the background.
      // In this function, make sure you hide the component(s) for entering the code and/or navigate away from this screen.
      // It is also recommended to display a message to the user informing him/her that he/she has successfully logged in.
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  async function signInWithPhoneNumber({ phone }: PhoneFormType) {
    try {
      auth().settings.appVerificationDisabledForTesting = true;
      const confirmationResult = await auth().signInWithPhoneNumber(
        '+91' + phone
      );
      setConfirmation(confirmationResult);
      setStep('otp');
    } catch (error) {
      console.log(error, 'error');
    }
  }

  async function verifyOTP({ otp }: OTPFormType) {
    try {
      if (confirmation) {
        await confirmation.confirm(otp);
        console.log('OTP verified successfully');
        onSubmit();
      }
    } catch (error) {
      console.log(error, 'error');
    }
  }

  function handleBack() {
    setStep('phone');
  }

  return (
    <View className="flex-1 justify-center p-4">
      {step === 'phone' ? (
        <PhoneNumberForm onNext={signInWithPhoneNumber} />
      ) : (
        <OTPForm onVerify={verifyOTP} onBack={handleBack} />
      )}
    </View>
  );
};
