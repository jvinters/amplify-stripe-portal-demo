import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { getSubscriptions } from './functions/get-subscriptions/resource';

defineBackend({
  auth,
  data,
  getSubscriptions,
});
