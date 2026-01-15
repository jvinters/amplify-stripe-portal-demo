import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { getSubscription } from './functions/getSubscription/resource';
import { sayHello } from './functions/sayHello/resource';

defineBackend({
  auth,
  data,
  getSubscription,
  sayHello
});
