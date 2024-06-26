import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { getTransactions } from '../functions';
// import type { Post } from './types';

type Variables = { friendId: string };
type Response = any;

export const useTransactions = createQuery<Response, Variables, AxiosError>({
  queryKey: ['transactions'],
  fetcher: (variables) => getTransactions(variables.phoneNumber),
});
