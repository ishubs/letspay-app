import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { getTransactionsForCurrentUser } from '../functions';
// import type { Post } from './types';

type Variables = { friendId: string };
type Response = any;

export const useCurrentUserTransactions = createQuery<
  Response,
  Variables,
  AxiosError
>({
  queryKey: ['current-user-transactions'],
  fetcher: () => getTransactionsForCurrentUser(),
});
