import { firebase } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';

import { usePosts } from '@/api';
import { Text, TouchableOpacity, View } from '@/ui';

const renderAvatar = (contact) => {
  console.log(contact, 'contact');
  if (!contact) return null;
  if (contact?.imageAvailable) {
    return (
      <Image
        source={{ uri: contact?.image }}
        className="mr-2.5 h-[60px] w-[60px] rounded-full"
      />
    );
  } else {
    return (
      <View className="mr-2.5 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-blue-600">
        <Text className="text-xl font-bold text-white">
          {contact?.firstName[0]}
          {contact?.lastName[0]}
        </Text>
      </View>
    );
  }
};

// eslint-disable-next-line max-lines-per-function
export default function Feed() {
  const { data, isPending, isError } = usePosts();
  const [transactions, setTransactions] = useState([]);
  const [netValue, setNetValue] = useState(null);
  const router = useRouter();
  // Assuming you have a function to get the current user's UID
  const getCurrentUserUID = () => {
    const currentUser = firebase.auth().currentUser;
    return currentUser ? currentUser.uid : null;
  };

  useEffect(() => {
    const uid = getCurrentUserUID();
    if (!uid) {
      console.error('No current user found');
      return;
    }

    // const getFriends = async (uid) => {
    //   const friendsRef = firestore().collection('friends').doc(uid);
    //   const snapshot = await friendsRef.get();
    //   return snapshot.data();
    // };

    const unsubscribe = firestore()
      .collection('friends')
      .doc(uid)
      .onSnapshot((snapshot) => {
        const friendsData = snapshot.data();
        // console.log(friendsData.friends, 'friendsData');
        setTransactions(friendsData?.friends || []);
        //calculate the overall value user is owed by adding amount from all the friends and set it to netValue
        const calculateNetValue = () => {
          let total = 0;
          friendsData?.friends.forEach((friend) => {
            total += parseFloat(friend.balance.toFixed(2));
          });
          setNetValue(total.toFixed(2));
        };

        calculateNetValue();
      });

    // getFriends(uid);

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => router.push(`/feed/${item.phoneNumber}`)}
      className="mb-8 flex-row items-center"
    >
      {/* Render contact avatar */}
      {renderAvatar(item)}

      {/* Render contact full name and amount owed */}
      <View className="ml-4 flex-1 flex-row items-center justify-between">
        <Text className="text-lg">{`${item.firstName} ${item.lastName}`}</Text>
        <View>
          <Text className="text-sm">
            {item.balance < 0 ? `you owe` : 'owes you'}
          </Text>
          <Text className="text-right text-lg text-gray-500">
            {`₹${Math.abs(item.balance)}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isError) {
    return (
      <View>
        <Text> Error Loading data </Text>
      </View>
    );
  }
  return (
    <View className="flex-1 p-4">
      <View>
        <View className="mt-8 flex  items-center justify-center gap-4">
          <Text>{netValue < 0 ? 'You pay' : 'You get back'} </Text>
          <Text className=" text-center text-6xl tracking-tight">
            ₹{Math.abs(netValue)}
          </Text>
        </View>
        <View className="mt-8 p-8">
          <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={<Text>No transactions found.</Text>}
          />
        </View>
      </View>

      {/* <View className="bordered-[1px] rounded-md border">< */}
    </View>
  );
}
