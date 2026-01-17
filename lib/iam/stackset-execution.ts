import * as iam from "aws-cdk-lib/aws-iam"
import { Role } from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs"

/**
 * Creates the AWSCloudFormationStackSetExecutionRole required for StackSet deployments.
 *
 * This role allows the Fastish host account's StackSet administration role to deploy
 * CloudFormation stacks in the subscriber's account.
 *
 * The role must be named exactly "AWSCloudFormationStackSetExecutionRole" for CloudFormation
 * to recognize it.
 */
export class StackSetExecutionRoleConstruct extends Construct {
  public role: Role

  constructor(scope: Construct, id: string) {
    super(scope, id + "-stackset-execution-role")

    const t = this.target()
    const h = this.host()

    // Create the StackSet execution role with the exact name CloudFormation expects
    this.role = new iam.Role(this, "AWSCloudFormationStackSetExecutionRole", {
      roleName: "AWSCloudFormationStackSetExecutionRole",
      description: "Execution role for CloudFormation StackSets deployed from Fastish platform",
      assumedBy: new iam.PrincipalWithConditions(
        new iam.ArnPrincipal(`arn:aws:iam::${h.account}:role/AWSCloudFormationStackSetAdministrationRole`),
        {
          StringEquals: {
            "sts:ExternalId": t.externalId,
            "aws:PrincipalAccount": h.account
          }
        }
      )
    })

    // Grant administrative access for StackSet deployments
    // You can restrict this to specific resources based on what your StackSets deploy
    this.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess")
    )

    // Alternative: Use restricted permissions (uncomment and customize as needed)
    // this.role.attachInlinePolicy(
    //   new iam.Policy(scope, `${id}-stackset-permissions-policy`, {
    //     policyName: `${id}-stackset-permissions`,
    //     roles: [this.role],
    //     document: this.stackSetPermissions()
    //   })
    // )
  }

  /**
   * Alternative restricted permissions instead of AdministratorAccess.
   * Customize this based on what resources your StackSets actually create.
   */
  private stackSetPermissions(): iam.PolicyDocument {
    return new iam.PolicyDocument({
      statements: [
        // S3 permissions for bucket creation
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "s3:CreateBucket",
            "s3:PutBucketEncryption",
            "s3:PutBucketPublicAccessBlock",
            "s3:PutBucketTagging",
            "s3:PutBucketVersioning",
            "s3:PutLifecycleConfiguration",
            "s3:DeleteBucket",
            "s3:GetBucketLocation"
          ],
          resources: ["*"]
        }),
        // DynamoDB permissions for table creation
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "dynamodb:CreateTable",
            "dynamodb:UpdateTable",
            "dynamodb:DeleteTable",
            "dynamodb:DescribeTable",
            "dynamodb:TagResource"
          ],
          resources: ["*"]
        }),
        // IAM permissions for role/policy management
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "iam:CreateRole",
            "iam:DeleteRole",
            "iam:PutRolePolicy",
            "iam:DeleteRolePolicy",
            "iam:AttachRolePolicy",
            "iam:DetachRolePolicy",
            "iam:GetRole",
            "iam:PassRole",
            "iam:TagRole"
          ],
          resources: ["*"]
        }),
        // CloudFormation permissions
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "cloudformation:DescribeStacks",
            "cloudformation:DescribeStackEvents",
            "cloudformation:DescribeStackResources",
            "cloudformation:GetTemplate"
          ],
          resources: ["*"]
        })
      ]
    })
  }

  private host() {
    return {
      account: this.node.getContext("host")?.account,
    }
  }

  private target() {
    const self = this.node.getContext("self")

    if (!/^[a-zA-Z]{3,}$/.test(self.name)) {
      throw new Error(`self.name must contain only alphabetical characters and be at least 3 characters long, got: "${self.name}"`)
    }

    return {
      account: self.account,
      name: self.name,
      region: self.region,
      externalId: self.externalId,
      subscriberRoleArn: self.subscriberRoleArn
    }
  }
}
