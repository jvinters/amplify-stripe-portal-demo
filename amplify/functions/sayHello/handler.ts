import { env } from '$amplify/env/say-hello';
import { Schema } from '../../data/resource';

export const handler: Schema["sayHello"]["functionHandler"] = async (event) => {
  const { name } = event.arguments;
  return `Hello, ${env.NAME}! (from: ${name})`;
};