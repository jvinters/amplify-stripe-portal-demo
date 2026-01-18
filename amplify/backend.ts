import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { getSubscriptions } from './functions/get-subscriptions/resource';
import { createPortalSession } from './functions/create-portal-session/resource';

defineBackend({
  auth,
  data,
  getSubscriptions,
  createPortalSession,
});
