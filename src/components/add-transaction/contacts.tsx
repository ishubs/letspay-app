/* eslint-disable max-lines-per-function */
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import type { Contact } from '@/api/types';

type ContactsListProps = {
  contacts: Contact[];
  selectedContacts: string[];
  onToggleSelectContact: (id: string) => void;
  onNext: () => void;
};

export const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  selectedContacts,
  onToggleSelectContact,
  onNext,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      className="flex-row items-center border-b border-gray-300 px-2 py-4"
      onPress={() => onToggleSelectContact(item.id)}
    >
      {selectedContacts.includes(item.id) ? (
        <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-green-500">
          <Text className="text-lg font-bold text-white">✓</Text>
        </View>
      ) : item.imageAvailable ? (
        <Image
          source={{ uri: item.image }}
          className="mr-4 h-10 w-10 rounded-full"
        />
      ) : (
        <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-blue-500">
          <Text className="text-lg font-bold text-white">
            {item.firstName[0]}
          </Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="text-lg font-bold">
          {item.firstName} {item.lastName}
        </Text>
        {item.phoneNumbers && item.phoneNumbers.length > 0 && (
          <Text className="text-gray-600">{item.phoneNumbers[0].number}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="relative mb-8">
      <TextInput
        placeholder="Search contacts"
        value={searchQuery}
        onChangeText={handleSearchChange}
        className="h-[44px] rounded-lg border border-gray-300 pl-2 pr-8"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity
          onPress={clearSearch}
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          <Text className="mr-4 text-gray-400">&#x2715;</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={filteredContacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      <TouchableOpacity
        onPress={onNext}
        className="mt-4 rounded-lg bg-blue-500 p-3"
      >
        <Text className="text-center text-white">Next</Text>
      </TouchableOpacity>
    </View>
  );
};
