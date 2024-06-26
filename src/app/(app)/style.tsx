import * as React from 'react';
import { ActivityIndicator, FlatList } from 'react-native';

import { useCurrentUserTransactions } from '@/api/transactions/current-user-transactions';
import {
  FocusAwareStatusBar,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from '@/ui';

const renderTransactionItem = ({ item }) => (
  <TouchableOpacity className="mb-4 rounded-lg border-b border-gray-300 bg-white p-4 shadow-md">
    <View className="flex-row items-center justify-between">
      <Text className="text-lg font-bold text-black">{item.description}</Text>
      <Text className="text-sm font-semibold text-gray-700">
        {item.amount} USD
      </Text>
    </View>
    <Text className="text-sm text-gray-500">Status: {item.status}</Text>
    <Text className="text-sm text-gray-500">Participants:</Text>
    <View className="flex-row flex-wrap">
      {item.participants.map((participant) => (
        <View
          key={participant.id}
          className="mb-2 mr-2 rounded-full bg-gray-200 px-2 py-1"
        >
          <Text className="text-xs text-gray-700">{participant.name}</Text>
        </View>
      ))}
    </View>
    <Text className="text-xs text-gray-400">
      Timestamp: {item.timestamp.toDate().toLocaleString()}
    </Text>
  </TouchableOpacity>
);

export default function Style() {
  const { data, isPending, isError } = useCurrentUserTransactions({
    //@ts-ignore
    variables: {},
  });

  console.log(data, 'data');

  if (isPending) {
    <View>
      <FocusAwareStatusBar />
      <ActivityIndicator />
    </View>;
  }

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView className="mt-16 px-4">
        {/* <Text>{JSON.stringify(data)}</Text> */}
        <FlatList
          data={data.hostTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text className="mt-4 text-center text-gray-500">
              No transactions found.
            </Text>
          }
        />
      </ScrollView>
    </>
  );
}
