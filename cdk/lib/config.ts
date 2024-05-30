import { ConfigContainer } from '@dsmrt/axiom-config';

export interface WhyCongnitoConfig extends ConfigContainer {
  s3Bucket: string;
}
