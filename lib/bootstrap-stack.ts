import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import { CdkHandshakeRoleConstruct } from "./iam/handshake"

/**
 * Bootstrap stack for Fastish subscriber accounts.
 *
 * Creates the handshake role that allows the Fastish platform to assume AWS CDK
 * default bootstrap roles for cross-account deployments.
 *
 * Prerequisites:
 * - Customer must have run: cdk bootstrap aws://{account}/{region}
 * - Customer must have the subscriber role ARN from Fastish onboarding
 */
export class BootstrapStack extends cdk.Stack {
  public handshake: CdkHandshakeRoleConstruct

  constructor(scope: Construct, id: string, name: string, props?: cdk.StackProps) {
    super(scope, id + `-${name}`, props)

    // Create the handshake role for cross-account access
    // This role allows the Fastish subscriber role to assume CDK default bootstrap roles
    this.handshake = new CdkHandshakeRoleConstruct(this, id)

    // Output the handshake role ARN and CDK bootstrap resource references
    const required = {
      roles: {
        handshake: this.handshake.role.roleArn,
      },
      cdk: {
        // Reference to AWS CDK default bootstrap resources (must exist)
        roles: {
          cfnExec: `arn:aws:iam::${this.account}:role/cdk-hnb659fds-cfn-exec-role-${this.account}-${this.region}`,
          deploy: `arn:aws:iam::${this.account}:role/cdk-hnb659fds-deploy-role-${this.account}-${this.region}`,
          filePublishing: `arn:aws:iam::${this.account}:role/cdk-hnb659fds-file-publishing-role-${this.account}-${this.region}`,
          imagePublishing: `arn:aws:iam::${this.account}:role/cdk-hnb659fds-image-publishing-role-${this.account}-${this.region}`,
          lookup: `arn:aws:iam::${this.account}:role/cdk-hnb659fds-lookup-role-${this.account}-${this.region}`,
        },
        storage: {
          assets: `arn:aws:s3:::cdk-hnb659fds-assets-${this.account}-${this.region}`,
          containerAssets: `arn:aws:ecr:${this.region}:${this.account}:repository/cdk-hnb659fds-container-assets-${this.account}-${this.region}`,
        }
      },
      subscriber: {
        name: this.node.getContext("self").name,
        account: this.account,
        region: this.region,
        externalId: this.node.getContext("self").externalId
      },
      host: {
        account: this.node.getContext("host").account,
      }
    }

    // Output resource information
    new cdk.CfnOutput(this, `${id}-resources`, {
      exportName: id,
      value: JSON.stringify(required),
      description: `${id} handshake role and CDK bootstrap resource references`
    })
  }
}
