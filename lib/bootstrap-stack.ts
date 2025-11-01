import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import { CdkHandshakeRoleConstruct } from "./iam/handshake"

// Minimal bootstrap stack for Fastish cross-account access
// Creates only the handshake role that can assume AWS CDK default bootstrap roles
// Assumes customer has already run: cdk bootstrap aws://{account}/{region}
export class BootstrapStack extends cdk.Stack {
  public handshake: CdkHandshakeRoleConstruct

  constructor(scope: Construct, id: string, name: string, props?: cdk.StackProps) {
    super(scope, id + `-${ name }`, props)

    // Create only the handshake role for cross-account access
    // This role allows the Fastish host account to assume CDK default roles
    this.handshake = new CdkHandshakeRoleConstruct(this, id)

    // Output the handshake role ARN
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
      }
    }

    // Output resource information
    new cdk.CfnOutput(this, "fastish-resources", {
      key: "fastish",
      value: JSON.stringify(required),
    })
  }
}
