import auth from '@react-native-firebase/auth';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { FlatList } from 'react-native';

import type { Tx } from '@/api';
import { useTransactions } from '@/api';
import { formatFirebaseTimestamp } from '@/core/utils/functions';
import {
  ActivityIndicator,
  Button,
  FocusAwareStatusBar,
  Text,
  TouchableOpacity,
  View,
} from '@/ui';
import { Bill as BillIcon } from '@/ui/icons';

const renderItem = ({ item }: { item: Tx }) => {
  const balance: number = Number(item.amount) / (item.participants.length + 1);
  const user = auth().currentUser;
  return (
    <TouchableOpacity
      className="mb-4 flex flex-row items-center gap-4 rounded-lg border-gray-300 bg-white p-4"
    // onPress={() => navigation.navigate('FeedItem', { itemId: item.id })}
    >
      <View className="flex flex-col">
        <Text>{formatFirebaseTimestamp(item.timestamp)[0]}</Text>
        <Text className="text-2xl">
          {formatFirebaseTimestamp(item.timestamp)[1]}
        </Text>
      </View>
      <View className="rounded-md  bg-gray-100 p-2">
        <BillIcon />
      </View>
      <View className="flex flex-1 justify-center">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-black">
            {item.description}
          </Text>
        </View>
        <Text className="text-sm text-gray-500">
          {item.hostName} paid {item.amount}
        </Text>
      </View>
      <View>
        <Text>{user.uid != item.host ? 'You owe' : 'You lent'}</Text>
        <Text className="text-lg font-semibold text-gray-700">₹ {balance}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function Post() {
  const local = useLocalSearchParams<{ id: string }>();
  const user = auth().currentUser;
  console.log(local.id, 'localid');
  const { data, isPending, isError } = useTransactions({
    //@ts-ignore
    variables: { friendId: local.id },
  });

  if (isPending) {
    return (
      <View className="flex-1 justify-center  p-3">
        <Stack.Screen options={{ title: 'Post', headerBackTitle: 'Feed' }} />
        <FocusAwareStatusBar />
        <ActivityIndicator />
      </View>
    );
  }
  if (isError) {
    return (
      <View className="flex-1 justify-center p-3">
        <Stack.Screen options={{ title: 'Post', headerBackTitle: 'Feed' }} />
        <FocusAwareStatusBar />
        <Text className="text-center">Error loading post</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-3 ">
      <Stack.Screen options={{ title: 'Post', headerBackTitle: 'Feed' }} />
      <FocusAwareStatusBar />
      <View className="mt-8 w-full text-center">
        <Text className="text-center text-2xl">
          {data.friend?.firstName} {data.friend?.lastName}
        </Text>
      </View>
      <View className="mt-8">
        <Button label="Settle up" size="lg" />
      </View>
      <View className={'flex-1 p-4'}>
        <FlatList
          data={data.transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text>No transactions found.</Text>}
        />
      </View>
    </View>
  );
}
