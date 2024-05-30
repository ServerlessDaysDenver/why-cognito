#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WhyCognitoStack } from '../lib/why-cognito-stack';
import { loadConfig } from '@dsmrt/axiom-config';
import { WhyCongnitoConfig } from './../lib/config';

const config = loadConfig<WhyCongnitoConfig>();

const app = new cdk.App();
new WhyCognitoStack(
  app,
  'WhyCognitoStack',
  {
    env: {
      account: config.aws.account,
      region: config.aws.region,
    },
  },
  config,
);
