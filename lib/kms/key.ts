import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import * as kms from "aws-cdk-lib/aws-kms"
import { Alias, Key } from "aws-cdk-lib/aws-kms"
import * as iam from "aws-cdk-lib/aws-iam"

// KMS encryption key construct for securing data at rest
// Provides encryption capabilities for CDK toolchain operations
export class CdkEncryptionKey extends Construct {
  public key: Key
  public alias: Alias

  constructor(scope: Construct, id: string) {
    super(scope, id + "-cdk-kms-encryption-key")

    const t = this.target()
    const name = `alias/${ id }-${ t.name.toLowerCase() }`

    // Create KMS key with automatic rotation enabled
    this.key = new kms.Key(this, "cdk-kms-encryption-key", {
      description: "kms key for cdk toolchain",
      keyUsage: kms.KeyUsage.ENCRYPT_DECRYPT,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      rotationPeriod: cdk.Duration.days(365)  // Automatic key rotation annually
    })

    // Create alias for easier key reference
    this.alias = new kms.Alias(this, "kms-key-alias", {
      aliasName: name,
      targetKey: this.key,
    })

    // Grant encryption/decryption permissions to AWS services
    const keyPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "kms:Decrypt",           // Allow decryption of encrypted data
        "kms:Encrypt",           // Allow encryption of data
        "kms:GenerateDataKey",   // Generate data encryption keys
        "kms:DescribeKey",       // Describe key metadata
      ],
      resources: [ "*" ],
      principals: [
        new iam.ServicePrincipal("cloudformation.amazonaws.com"),  // CloudFormation deployments
        new iam.ServicePrincipal("codepipeline.amazonaws.com"),    // CI/CD pipelines
        new iam.ServicePrincipal("codedeploy.amazonaws.com"),      // Code deployments
      ],
    })

    // Grant full KMS permissions to the account
    const accountPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [ "kms:*" ],  // Full KMS permissions for account management
      resources: [ "*" ],
      principals: [ new iam.AccountPrincipal(t.account) ],
    })

    this.key.addToResourcePolicy(keyPolicyStatement)
    this.key.addToResourcePolicy(accountPolicyStatement)
  }

  private target() {
    const synthesizer = this.node.getContext("synthesizer")

    return {
      account: synthesizer.account,
      name: synthesizer.name,
    }
  }
}
