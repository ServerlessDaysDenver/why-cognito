import {
  APIGatewaySimpleAuthorizerWithContextResult,
  APIGatewayRequestSimpleAuthorizerHandlerV2,
  APIGatewayRequestAuthorizerEventV2,
} from 'aws-lambda';

import { CognitoJwtVerifier } from 'aws-jwt-verify';

interface RequestContext {
  tenantId: string;
}
export const handler: APIGatewayRequestSimpleAuthorizerHandlerV2 = async (
  event: APIGatewayRequestAuthorizerEventV2,
) => {
  const token = event.headers?.authorization?.replace('Bearer ', '') || 'BAD_REQUEST';
  console.log(event.identitySource[0]);
  // verify token
  console.log({
    token,
    event,
    userPoolId: `${process.env.USER_POOL_ID}`,
    tokenUse: 'access',
    clientId: `${process.env.USER_POOL_CLIENT_ID}`,
  });
  // Verifier that expects valid access tokens:
  const verifier = CognitoJwtVerifier.create({
    userPoolId: `${process.env.USER_POOL_ID}`,
    tokenUse: 'access',
    clientId: `${process.env.USER_POOL_CLIENT_ID}`,
  });

  const result: APIGatewaySimpleAuthorizerWithContextResult<RequestContext> = {
    isAuthorized: false,
    context: { tenantId: '' },
  };
  try {
    const payload = await verifier.verify(token);
    console.log(payload);
    result.isAuthorized = true;
    result.context.tenantId = payload['tenantId'] as string;
  } catch (e) {
    console.error(e);
  }

  return result;
};
