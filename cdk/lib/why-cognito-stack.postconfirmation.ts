import { PostConfirmationTriggerHandler, PostConfirmationTriggerEvent } from 'aws-lambda';
import {
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { v4 as uuidv4 } from 'uuid';

const region = process.env.AWS_REGION || 'us-east-1';
export const handler: PostConfirmationTriggerHandler = async (event: PostConfirmationTriggerEvent) => {
  // we need to get the custom attribute for tenant id
  const client = new CognitoIdentityProviderClient({
    region,
  });

  const command = new AdminUpdateUserAttributesCommand({
    Username: event.userName,
    UserPoolId: event.userPoolId,
    UserAttributes: [
      {
        Name: 'custom:tenant',
        Value: await determineTenantId(event),
      },
    ],
  });

  await client.send(command);

  return event;
};

const determineTenantId = async (event: PostConfirmationTriggerEvent) => {
  // maybe email domain lookup to match existing domain
  return uuidv4();
};
