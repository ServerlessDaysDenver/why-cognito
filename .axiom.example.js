/**
 * @type {import("./cdk/lib/config").WhyCongnitoConfig}
 */
const config = {
  name: 'why-cognito',
  env: 'prod',
  aws: {
    profile: 'prod_account',
    account: '99999999999',
    region: 'us-east-1',
    baseParameterPath: '/why-cognito/prod',
  },
  s3Bucket: 'my-bucket',
};

module.exports = config;
