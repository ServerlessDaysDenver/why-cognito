import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { WhyCongnitoConfig } from './config';
import { ConfigContainer } from '@dsmrt/axiom-config';

import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';

export class WhyCognitoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps, config: WhyCongnitoConfig & ConfigContainer) {
    super(scope, id, props);

    //
    const preTokenGeneration = new lambda.NodejsFunction(this, 'pretokengen', {});
    const postConfirmation = new lambda.NodejsFunction(this, 'postconfirmation', {});
    // The code that defines your stack goes here
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `${config.name}-${config?.env}`,
      selfSignUpEnabled: true,
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
        givenName: {
          required: true,
          mutable: true,
        },
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      customAttributes: {
        tenant: new cognito.StringAttribute({}),
      },
      advancedSecurityMode: cognito.AdvancedSecurityMode.ENFORCED,
    });

    userPool.addTrigger(cognito.UserPoolOperation.POST_CONFIRMATION, postConfirmation);
    userPool.addTrigger(
      cognito.UserPoolOperation.PRE_TOKEN_GENERATION_CONFIG,
      preTokenGeneration,
      cognito.LambdaVersion.V2_0,
    );

    const astroClient = userPool.addClient('astro', {
      userPoolClientName: `${config.name}-${config.env}-AstroFrontend`,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    });

    // avoid circular dependency using role attachInlinePolicy
    postConfirmation.role?.attachInlinePolicy(
      new iam.Policy(this, 'PostConfUpdateUser', {
        statements: [
          new iam.PolicyStatement({
            // https://docs.aws.amazon.com/service-authorization/latest/reference/list_amazoncognitouserpools.html
            actions: ['cognito-idp:AdminUpdateUserAttributes'],
            effect: iam.Effect.ALLOW,
            resources: [userPool.userPoolArn],
          }),
        ],
      }),
    );

    /**
     * Identity Pool
     */
    const idPoolAuthenticated = new cognito.CfnIdentityPool(this, 'identityPool', {
      identityPoolName: `${config.name}-${config.env}`,
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: astroClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });

    const idPoolAuthenticatiedRole = new iam.Role(this, 'IdPoolAuthenticatiedRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': idPoolAuthenticated.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
      inlinePolicies: {
        root: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['cognito-identity:GetCredentialsForIdentity'],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:ListBucket'],
              resources: [`arn:aws:s3:::${config.s3Bucket}`],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['s3:GetObject'],
              resources: [`arn:aws:s3:::${config.s3Bucket}/*`],
            }),
          ],
        }),
      },
    });

    new cognito.CfnIdentityPoolRoleAttachment(this, 'IdPoolRoleAttachment', {
      identityPoolId: idPoolAuthenticated.ref,
      roles: {
        authenticated: idPoolAuthenticatiedRole.roleArn,
      },
    });

    /**
     * API GW
     */
    const todo = new lambda.NodejsFunction(this, 'api-todo', {});
    const authorizerLambda = new lambda.NodejsFunction(this, 'api-authorizer', {});
    authorizerLambda.addEnvironment('USER_POOL_ID', userPool.userPoolId);
    authorizerLambda.addEnvironment('USER_POOL_CLIENT_ID', astroClient.userPoolClientId);

    const httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      corsPreflight: {
        allowHeaders: ['Authorization'],
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.HEAD,
          apigwv2.CorsHttpMethod.OPTIONS,
          apigwv2.CorsHttpMethod.POST,
        ],
        allowOrigins: ['http://localhost:4321'],
        maxAge: cdk.Duration.days(10),
      },
    });

    const authorizer = new HttpLambdaAuthorizer('TodoAuthorizer', authorizerLambda, {
      responseTypes: [HttpLambdaResponseType.SIMPLE], // Define if returns simple and/or iam response
    });

    httpApi.addRoutes({
      path: '/todo',
      methods: [apigwv2.HttpMethod.GET],
      integration: new HttpLambdaIntegration('TodoIntegration', todo),
      authorizer,
    });

    /**
     * OUTPUTS
     */
    new cdk.CfnOutput(this, 'userPoolId', {
      description: 'Cognito UserPool ID',
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, 'userPoolClientId', {
      description: 'Cognito UserPool Client ID for Astro Frontend',
      value: astroClient.userPoolClientId,
    });

    new cdk.CfnOutput(this, 'idPoolIdAuthenticatied', {
      description: 'Identity Pool Id for Authenticated Users',
      value: idPoolAuthenticated.ref,
    });

    new cdk.CfnOutput(this, 'idPoolAuthenticatiedRole', {
      description: 'Identity Pool Role for Authenticated Users',
      value: idPoolAuthenticatiedRole.roleArn,
    });

    new cdk.CfnOutput(this, 'apiUrl', {
      description: 'API GW URL',
      value: httpApi.url as string,
    });
  }
}
