import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import { CdkEncryptionKey } from "./kms/key"
import { CdkVersionParameter } from "./ssm/parameter"

// Nested stack for encryption and parameter management
// Provides KMS keys for data encryption and SSM parameters for configuration storage
export class FastishKeys extends cdk.NestedStack {
  public kms: CdkEncryptionKey      // KMS key for encrypting sensitive data
  public ssm: CdkVersionParameter    // SSM parameter for storing version and configuration

  constructor(scope: Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id + "-keys", props)

    // KMS encryption key for securing sensitive data at rest
    this.kms = new CdkEncryptionKey(scope, id)
    // SSM parameter for storing version information and configuration
    this.ssm = new CdkVersionParameter(scope, id)
  }
}
