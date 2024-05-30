import { Context, PreTokenGenerationV2TriggerHandler, PreTokenGenerationV2TriggerEvent } from 'aws-lambda';
import { AdminGetUserCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

const region = process.env.AWS_REGION || 'us-east-1';
export const handler: PreTokenGenerationV2TriggerHandler = async (event: PreTokenGenerationV2TriggerEvent) => {
  const tenantId = event.request.userAttributes['custom:tenant'];
  // find the sub object that we want to work with
  const claimsToAddOrOverride = {
    tenantId: tenantId,
  };
  event.response.claimsAndScopeOverrideDetails = {
    accessTokenGeneration: {
      claimsToAddOrOverride,
    },
  };

  return event;
};
