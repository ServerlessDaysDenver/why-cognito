# Why Cognito?

Purpose of this repo is to demonstrate how to get up and running with Coginto 
using CDK and Astro (with React) as the frontend.

Highlighting Features:
- Lambda Authorizer with Request Context
- User Pool as the IdP
- User Pool triggers to add tenant id to user based on custom logic

## Getting Started

### Install Dependencies
```bash
pnpm install
```

### Prep config file

### Deploy

```bash
pnpm cdk deploy
```

#### Add Outputs for Astro

```bash
./astro-add-outputs <aws_profile>
```

### Run Astro

```bash
pnpm astro:dev
```
