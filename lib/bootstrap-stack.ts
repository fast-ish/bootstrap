import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import { StackSetExecutionRoleConstruct } from "./iam/stackset-execution"

/**
 * Bootstrap stack for Fastish subscriber accounts.
 *
 * Creates the AWSCloudFormationStackSetExecutionRole that allows the Fastish platform
 * to deploy infrastructure via CloudFormation StackSets.
 *
 * This role must exist in the subscriber's account before StackSet instances can be created.
 */
export class BootstrapStack extends cdk.Stack {
  public stackSetExecutionRole: StackSetExecutionRoleConstruct

  constructor(scope: Construct, id: string, name: string, props?: cdk.StackProps) {
    super(scope, id + `-${name}`, props)

    // Create the StackSet execution role for cross-account deployments
    // This role allows the Fastish host account to deploy CloudFormation stacks
    this.stackSetExecutionRole = new StackSetExecutionRoleConstruct(this, id)

    // Output the execution role ARN
    const required = {
      roles: {
        stackSetExecution: this.stackSetExecutionRole.role.roleArn,
      },
      subscriber: {
        name: this.node.getContext("self").name,
        account: this.account,
        region: this.region,
        externalId: this.node.getContext("self").externalId
      },
      host: {
        account: this.node.getContext("host").account,
        stackSetAdminRole: `arn:aws:iam::${this.node.getContext("host").account}:role/AWSCloudFormationStackSetAdministrationRole`
      }
    }

    // Output resource information
    new cdk.CfnOutput(this, "fastish-stackset-resources", {
      exportName: "fastish-stackset",
      value: JSON.stringify(required),
      description: "Fastish StackSet execution role and subscriber information"
    })
  }
}
