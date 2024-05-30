# Why Cognito?

Purpose of this repo is to demonstrate how to get up and running with Coginto 
using CDK and Astro (with React) as the frontend. 

> [!CAUTION]
> The frontend/react/astro code is very basic and meant to show how things can, 
> at a basic level, come together. 
> Use the code (any of it) at your own risk

Highlighting Features:
- Lambda Authorizer validating a Cognito User Pool Token with Request Context
- Cognito User Pool as the IdP
- Cognito User Pool triggers to add tenant id to user based on custom logic
- Cognito User Pool triggers to add claims to the access token
- Cognito Identity Pool auth from the astro app which runs a S3 list objects

## Getting Started

### Install Dependencies
```bash
pnpm install
```

### Prep config file
Copy the `.axiom.example.js` file to `.axiom.js` and add your details, including
aws account number, aws region, s3 bucket, etc

### Deploy

```bash
pnpm cdk deploy
```

#### Add Outputs for Astro

The following command will add required outputs to make them available for astro (the front end app)

```bash
./astro-add-outputs <aws_profile>
```

### Run Astro

```bash
pnpm astro:dev
```

## Useful Resources
- [Amplify Authenticator React Component](https://docs.amplify.aws/react/build-a-backend/auth/set-up-auth/#connect-your-application-code-to-your-auth-resource)
- [AWS CDK Cognito](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cognito-readme.html)
- [Astro website](http://astro.build/)
