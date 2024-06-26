import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import type { Friend, Participant, TransactionPayload } from '../types';

export const saveTransaction = async (
  participants: Participant[],
  amount: string,
  description: string
) => {
  const txId: string | undefined = await saveMainTransaction(
    participants,
    amount,
    description
  );

  if (!txId) {
    console.error('Error saving main transaction!');
    return;
  }
  await updateNetBalances(participants, txId);
};

const saveMainTransaction = async (
  participants: Participant[],
  amount: string,
  description: string
) => {
  const user = auth().currentUser;
  // const hostShare = individualShare;
  if (!user) return;
  try {
    // we need to find if the participant is a user or not
    // if the participant is a user then we need to update the id of the participant with the user id

    const hostDoc = await firestore().collection('users').doc(user.uid).get();

    if (!hostDoc.exists) {
      console.error('Host user not found');
      return;
    }

    const hostData = hostDoc.data();
    const hostName = hostData?.firstName + ' ' + hostData?.lastName;

    const transactionData: TransactionPayload = {
      host: user.uid,
      hostName: hostName,
      participants: participants,
      status: 'pending',
      amount,
      description,
      timestamp: firestore.FieldValue.serverTimestamp(),
    };

    const savedTxRef = await firestore()
      .collection('transactions')
      .add(transactionData);
    const savedTxId = savedTxRef.id;
    console.log('Main transaction saved successfully! ID:', savedTxId);
    return savedTxId;
  } catch (error) {
    console.error('Error saving Main transaction: ', error);
  }
};

/**
 * Checks if a user exists using their phone number and returns the document ID of the matching user.
 * @param phoneNumber - The phone number of the user to check.
 * @returns The document ID of the matching user, or null if no user is found.
 */
export const checkUserExistsUsingPhone = async (phoneNumber: string) => {
  try {
    const user = await firestore()
      .collection('users')
      .where('phone', '==', phoneNumber)
      .get();
    console.log('User:', user);
    if (!user.empty) {
      const doc = user.docs[0];
      return doc.id;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error checking user existence:', error);
  }
};

// Helper function to get or initialize friends for the current user
const getOrInitializeUserFriends = async (
  userId: string
): Promise<Friend[]> => {
  const userFriendsRef = firestore().collection('friends').doc(userId);
  const friendsSnapshot = await userFriendsRef.get();

  if (!friendsSnapshot.exists) {
    const initialFriends: Friend[] = [];
    await userFriendsRef.set({ friends: initialFriends });
    return initialFriends;
  }

  return friendsSnapshot.data()?.friends || [];
};

// Helper function to update the friend's collection for a participant

const updateParticipantFriends = async (
  participantId: string,
  user: any,
  participant: Participant,
  txId: string
  // eslint-disable-next-line max-params
): Promise<void> => {
  const participantFriendsRef = firestore()
    .collection('friends')
    .doc(participantId);
  const participantFriendsSnapshot = await participantFriendsRef.get();

  if (participantFriendsSnapshot.exists) {
    const participantFriends: Friend[] =
      participantFriendsSnapshot.data()?.friends || [];
    const participantFriend = participantFriends.find(
      (f: Friend) => f.phoneNumber === user.phoneNumber
    );

    if (participantFriend) {
      participantFriend.balance += -1 * participant.amount;
      participantFriend.transactions?.push(txId);
    } else {
      participantFriends.push({
        id: user.uid,
        balance: participant.amount,
        status: 'verified',
        phoneNumber: user.phoneNumber,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ')[1] || '',
        profilePicture: user.photoURL || '',
        transactions: [txId],
      });
    }

    await participantFriendsRef.update({ friends: participantFriends });
  } else {
    console.log('Participant friends not found, creating new entry...');
    const userDoc = await firestore().collection('users').doc(user.uid).get();
    const userDetails = userDoc.data();

    console.log(userDetails, 'userDetails');

    await participantFriendsRef.set({
      friends: [
        {
          id: user.uid,
          balance: -1 * participant.amount,
          status: 'verified',
          phoneNumber: user.phoneNumber,
          firstName: userDetails?.firstName || '',
          lastName: userDetails?.lastName || '',
          profilePicture: userDetails?.profilePicture || '',
          transactions: [txId],
        },
      ],
    });
  }
};

// Main function to update net balances
export const updateNetBalances = async (
  participants: Participant[],
  txId: string
) => {
  try {
    const user = auth().currentUser;
    if (!user) return;

    let friends = await getOrInitializeUserFriends(user.uid);

    for (const participant of participants) {
      const friend = friends.find(
        (f: Friend) => f.phoneNumber === participant.phoneNumber
      );
      const participantId = await checkUserExistsUsingPhone(
        participant.phoneNumber
      );

      //participant is a user
      if (participantId) {
        participant.id = participantId;
        await updateParticipantFriends(participantId, user, participant, txId);
      }

      if (friend) {
        friend.balance += participant.amount;
        friend.transactions?.push(txId);
      } else {
        friends.push({
          id: participant.id || '',
          balance: participant.amount,
          status: participantId ? 'verified' : 'pending',
          phoneNumber: participant.phoneNumber,
          firstName: participant.firstName,
          lastName: participant.lastName,
          profilePicture: participant.profilePicture,
          transactions: [txId],
        });
      }
    }

    await firestore().collection('friends').doc(user.uid).update({ friends });
    console.log('Current user friends updated successfully!');
  } catch (error) {
    console.error('Error updating net balances:', error);
  }
};

// write a function to get the transactions of a user with another user
// get the transactions of the current user with the friend from the friends collection

export const findFriendTransactions = async (phoneNumber: string) => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error('User not authenticated');

    // Step 1: Find the friend with the given phone number
    const userDoc = await firestore().collection('friends').doc(user.uid).get();

    if (!userDoc.exists) {
      throw new Error('User document not found');
    }

    const friends = userDoc.data()?.friends || [];
    const friend = friends.find(
      (friend: any) => friend.phoneNumber === phoneNumber
    );

    if (!friend) {
      throw new Error('Friend not found');
    }

    // Step 2: Retrieve transactions based on IDs stored in the friend's transactions array
    const transactionIds = friend.transactions || []; // Assuming transactions array contains IDs
    const transactionPromises = transactionIds.map(
      async (transactionId: string) => {
        const transactionDoc = await firestore()
          .collection('transactions')
          .doc(transactionId)
          .get();
        if (transactionDoc.exists) {
          return {
            id: transactionDoc.id,
            ...transactionDoc.data(),
          };
        } else {
          throw new Error(`Transaction with ID ${transactionId} not found`);
        }
      }
    );

    const transactions = await Promise.all(transactionPromises);

    console.log('Transactions:', transactions);
    return { transactions, friend };
  } catch (error) {
    console.error('Error finding friend transactions:', error);
    return []; // Return empty array or handle error as per your application's logic
  }
};

export const getTransactionsForCurrentUser = async () => {
  const user = auth().currentUser;
  if (!user) return;

  try {
    const userId = user.uid;
    const userPhoneNumber = user.phoneNumber;
    // Query transactions where the current user is the host
    const hostTransactionsQuery = await firestore()
      .collection('transactions')
      .where('host', '==', userId)
      .get();

    // Query transactions where the current user is a participant
    const participantTransactionsQuery = await firestore()
      .collection('transactions')
      .where('participants', 'array-contains', { phoneNumber: userPhoneNumber })
      .get();

    // Process results
    const hostTransactions = hostTransactionsQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const participantTransactions = participantTransactionsQuery.docs.map(
      (doc) => ({
        id: doc.id,
        ...doc.data(),
      })
    );

    // Combine and return all transactions involving the current user
    return {
      hostTransactions,
      participantTransactions,
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const getUserByPhoneNumber = async (phoneNumber: string) => {
  try {
    const usersRef = firestore().collection('users');
    const querySnapshot = await usersRef
      .where('phone', '==', phoneNumber)
      .get();

    if (querySnapshot.empty) {
      throw new Error('User not found');
    }

    // Since phone numbers should be unique, there should only be one document if found
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    console.log('User data:', userData);
    // You can optionally return the user ID along with the data
    return {
      id: userDoc.id,
      ...userData,
    };
  } catch (error) {
    console.error('Error fetching user by phone number:', error);
    throw error; // Propagate the error for handling at the caller's level
  }
};
