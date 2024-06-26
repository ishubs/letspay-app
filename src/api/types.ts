import type { FieldValue } from '@react-native-firebase/firestore';

export type PaginateQuery<T> = {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
};

export type Participant = {
  id?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePicture: string;
  amount: number;
  status: string;
};

export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  imageAvailable: boolean;
  image?: string;
  phoneNumbers: { number: string }[];
};

export type Friend = {
  id: string;
  firstName: string;
  lastName: string;
  balance: number;
  profilePicture: string;
  phoneNumber: string;
  status: 'verified' | 'pending';
  transactions?: string[];
};

export interface TransactionPayload {
  participants: Participant[];
  amount: string;
  description: string;
  status: string;
  timestamp: FieldValue;
  host: string;
  hostName: string;
}

export interface Tx extends TransactionPayload {
  id: string;
}
