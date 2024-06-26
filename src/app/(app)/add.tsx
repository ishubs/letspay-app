/* eslint-disable max-lines-per-function */
import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { saveTransaction } from '@/api/functions';
import type { Contact, Participant } from '@/api/types';
import { ContactsList } from '@/components/add-transaction/contacts';
import { TransactionForm } from '@/components/add-transaction/form';
import { Button, Modal, useModal, View } from '@/ui';

export default function AddTransaction() {
  const { ref, present, dismiss } = useModal();
  const router = useRouter();
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [screen, setScreen] = useState<'contacts' | 'amount'>('contacts');

  const getContacts = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync();
      console.log(data);
      setContacts(data as Contact[]);
    }
  };

  useEffect(() => {
    getContacts();
    setTimeout(() => {
      setScreen('contacts');
    }, 300);
  }, []);

  const toggleSelectContact = (id: string) => {
    console.log(id);
    setSelectedContacts((prevSelected: string[]) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId: string) => selectedId !== id)
        : [...prevSelected, id]
    );
  };

  const handleSaveTransaction = async (data: {
    amount: string;
    description: string;
  }) => {
    const totalAmount = parseFloat(data.amount);
    const numberOfParticipants = selectedContacts.length + 1;
    const individualShare = totalAmount / numberOfParticipants;

    const participantShare = individualShare * 1;
    const participants: Participant[] = selectedContacts
      .map((contactId) => {
        const contact: Contact | undefined = contacts.find(
          (contact) => contact.id === contactId
        );
        if (contact)
          return {
            id: '',
            firstName: contact.firstName,
            lastName: contact.lastName,
            phoneNumber:
              '+91' + contact.phoneNumbers[0]?.number.split(' ').join(''),
            profilePicture: '',
            amount: participantShare,
          };
        return null;
      })
      .filter((participant) => participant !== null) as Participant[];

    await saveTransaction(participants, data.amount, data.description);
    console.log('Transaction saved successfully!');
    setSelectedContacts([]);
    setScreen('contacts');
    dismiss();
    router.push('/');
  };

  return (
    <View className="flex-1 items-center justify-center p-4">
      <Button label="Split bill" onPress={() => present()} />
      <Modal snapPoints={['95%']} title="Add Contacts" ref={ref}>
        <View className="h-full p-4">
          {screen === 'contacts' ? (
            <ContactsList
              contacts={contacts.length > 0 ? contacts : []}
              selectedContacts={selectedContacts}
              onToggleSelectContact={toggleSelectContact}
              onNext={() => setScreen('amount')}
            />
          ) : (
            <TransactionForm onSubmit={handleSaveTransaction} />
          )}
        </View>
      </Modal>
    </View>
  );
}
