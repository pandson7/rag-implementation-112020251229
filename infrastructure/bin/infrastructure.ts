#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { RagImplementationStack112020251229 } from '../lib/infrastructure-stack';

const app = new cdk.App();
new RagImplementationStack112020251229(app, 'RagImplementationStack112020251229', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
