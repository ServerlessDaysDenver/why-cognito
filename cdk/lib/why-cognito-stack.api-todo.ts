import { APIGatewayProxyEventV2WithLambdaAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Context } from 'vm';

interface RequestContext {
  tenantId: string;
}
export const handler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<RequestContext>, context: Context) => {
  console.log(event, context);
  const result: APIGatewayProxyResultV2 = {
    statusCode: 200,
    body: JSON.stringify({
      id: 1,
      task: 'create slides for meetup talk',
      tenantId: event.requestContext.authorizer.lambda.tenantId,
    }),
  };
  return result;
};
