import * as iam from "aws-cdk-lib/aws-iam"
import { Role } from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs"

export class CdkHandshakeRoleConstruct extends Construct {
  public role: Role

  constructor(scope: Construct, id: string) {
    super(scope, id + "-cdk-handshake-role")

    const t = this.target()
    const name = `${ id }-${ t.name }-handshake`

    // Trust policy allows:
    // 1. Subscriber's portal role (with external ID) for role chaining
    // 2. EventBridge service for cross-account Lambda invocation callbacks
    this.role = new iam.Role(this, name, {
      roleName: name,
      assumedBy: new iam.CompositePrincipal(
        new iam.PrincipalWithConditions(
          new iam.ArnPrincipal(t.roleArn), {
            StringEquals: {
              "sts:ExternalId": t.externalId,
              "aws:PrincipalAccount": this.host().account
            }
          }),
        new iam.ServicePrincipal("events.amazonaws.com")
      )
    })

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-handshake-can-assume-roles-policy`, {
        policyName: `${ id }-handshake-can-assume-roles`,
        roles: [ this.role ],
        document: this.canAssumeRoles(id)
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-handshake-can-describe-azs-policy`, {
        policyName: `${ id }-handshake-can-describe-azs`,
        roles: [ this.role ],
        document: this.canDescribeAvailabilityZones(id)
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-handshake-can-simulate-principals-policy`, {
        policyName: `${ id }-handshake-can-simulate-principals`,
        roles: [ this.role ],
        document: this.canSimulatePrincipalPolicies(id)
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-handshake-can-access-assets-policy`, {
        policyName: `${ id }-handshake-can-access-assets`,
        roles: [ this.role ],
        document: this.canAccessAssets(id)
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-handshake-can-get-service-quotas-policy`, {
        policyName: `${ id }-handshake-can-get-service-quotas`,
        roles: [ this.role ],
        document: this.canGetServiceQuotas(id)
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-handshake-can-read-secrets-policy`, {
        policyName: `${ id }-handshake-can-read-secrets`,
        roles: [ this.role ],
        document: this.canReadSecrets(id)
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-handshake-can-get-hosted-zone-info-policy`, {
        policyName: `${ id }-handshake-can-get-hosted-zone-info`,
        roles: [ this.role ],
        document: this.canGetHostedZoneInfo(id)
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-handshake-can-access-ecr-policy`, {
        policyName: `${ id }-handshake-can-access-ecr`,
        roles: [ this.role ],
        document: this.canAccessEcr(id)
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-handshake-can-deploy-workloads-policy`, {
        policyName: `${ id }-handshake-can-deploy-workloads`,
        roles: [ this.role ],
        document: this.canDeployWorkloads(id)
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-handshake-can-invoke-callback-policy`, {
        policyName: `${ id }-handshake-can-invoke-callback`,
        roles: [ this.role ],
        document: this.canInvokeCallback(id)
      }))
  }

  private canAssumeRoles(id: string): iam.PolicyDocument {
    const t = this.target()

    // Allow assuming AWS CDK default bootstrap roles
    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [ "sts:AssumeRole" ],
          resources: [
            `arn:aws:iam::${ t.account }:role/cdk-hnb659fds-cfn-exec-role-${ t.account }-${ t.region }`,
            `arn:aws:iam::${ t.account }:role/cdk-hnb659fds-deploy-role-${ t.account }-${ t.region }`,
            `arn:aws:iam::${ t.account }:role/cdk-hnb659fds-file-publishing-role-${ t.account }-${ t.region }`,
            `arn:aws:iam::${ t.account }:role/cdk-hnb659fds-image-publishing-role-${ t.account }-${ t.region }`,
            `arn:aws:iam::${ t.account }:role/cdk-hnb659fds-lookup-role-${ t.account }-${ t.region }`,
          ],
          conditions: {
            StringEquals: {
              "aws:PrincipalAccount": t.account
            }
          }
        })
      ]
    })
  }

  private canDescribeAvailabilityZones(id: string): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [ "ec2:DescribeAvailabilityZones" ],
          resources: [ "*" ],
          conditions: {
            StringEquals: {
              "aws:PrincipalAccount": t.account
            }
          }
        })
      ]
    })
  }

  private canSimulatePrincipalPolicies(id: string): iam.PolicyDocument {
    const t = this.target()

    // Allow simulating AWS CDK default bootstrap roles and self (handshake role)
    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [ "iam:SimulatePrincipalPolicy" ],
          resources: [
            this.role.roleArn,
            `arn:aws:iam::${ t.account }:role/cdk-hnb659fds-cfn-exec-role-${ t.account }-${ t.region }`,
            `arn:aws:iam::${ t.account }:role/cdk-hnb659fds-deploy-role-${ t.account }-${ t.region }`,
            `arn:aws:iam::${ t.account }:role/cdk-hnb659fds-file-publishing-role-${ t.account }-${ t.region }`,
            `arn:aws:iam::${ t.account }:role/cdk-hnb659fds-image-publishing-role-${ t.account }-${ t.region }`,
            `arn:aws:iam::${ t.account }:role/cdk-hnb659fds-lookup-role-${ t.account }-${ t.region }`,
          ],
          conditions: {
            StringEquals: {
              "aws:PrincipalAccount": t.account
            }
          }
        })
      ]
    })
  }

  private canAccessAssets(id: string): iam.PolicyDocument {
    const t = this.target()

    // Allow access to AWS CDK default bootstrap S3 bucket
    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "s3:PutObject",
            "s3:GetObject",
            "s3:GetEncryptionConfiguration",
            "s3:ListBucket",
            "s3:GetBucketLocation"
          ],
          resources: [
            `arn:aws:s3:::cdk-hnb659fds-assets-${ t.account }-${ t.region }`,
            `arn:aws:s3:::cdk-hnb659fds-assets-${ t.account }-${ t.region }/*`
          ],
          conditions: {
            StringEquals: {
              "aws:PrincipalAccount": t.account
            }
          }
        })
      ]
    })
  }

  private canGetServiceQuotas(id: string): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [ "servicequotas:GetServiceQuota" ],
          resources: [ "*" ]
        }),
      ]
    })
  }

  private canReadSecrets(id: string): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "secretsmanager:GetSecretValue",
            "secretsmanager:DescribeSecret"
          ],
          resources: [ `arn:aws:secretsmanager:${ t.region }:${ t.account }:secret:${ id }*${ t.name }*` ]
        })
      ]
    })
  }

  private canGetHostedZoneInfo(id: string): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "route53:GetHostedZone",
            "route53:GetHealthCheckStatus"
          ],
          resources: [ "arn:aws:route53:::hostedzone/*" ]
        })
      ]
    })
  }

  private canAccessEcr(id: string): iam.PolicyDocument {
    const t = this.target()

    // Allow access to AWS CDK default bootstrap ECR repository
    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "ecr:PutImage",
            "ecr:InitiateLayerUpload",
            "ecr:UploadLayerPart",
            "ecr:CompleteLayerUpload",
            "ecr:BatchCheckLayerAvailability",
            "ecr:GetAuthorizationToken",
            "ecr:DescribeRepositories"
          ],
          resources: [
            `arn:aws:ecr:${ t.region }:${ t.account }:repository/cdk-hnb659fds-container-assets-${ t.account }-${ t.region }`
          ]
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [ "ecr:GetAuthorizationToken" ],
          resources: [ "*" ]
        })
      ]
    })
  }

  private canDeployWorkloads(id: string): iam.PolicyDocument {
    const t = this.target()

    // Allow deploying workloads via CloudFormation and managing EventBridge rules
    return new iam.PolicyDocument({
      statements: [
        // EventBridge rules for CloudFormation event callbacks
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "events:PutRule",
            "events:PutTargets",
            "events:DeleteRule",
            "events:RemoveTargets",
            "events:ListTargetsByRule"
          ],
          resources: [ `arn:aws:events:${ t.region }:${ t.account }:rule/cfn-*` ]
        }),
        // CloudFormation stack management
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "cloudformation:CreateStack",
            "cloudformation:UpdateStack",
            "cloudformation:DeleteStack",
            "cloudformation:DescribeStacks",
            "cloudformation:DescribeStackEvents",
            "cloudformation:GetTemplate",
            "cloudformation:CreateChangeSet",
            "cloudformation:DescribeChangeSet",
            "cloudformation:ExecuteChangeSet"
          ],
          resources: [ `arn:aws:cloudformation:${ t.region }:${ t.account }:stack/${ id }-*/*` ]
        }),
        // S3 bucket management for workload resources (e.g., Druid deep storage)
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "s3:CreateBucket",
            "s3:DeleteBucket",
            "s3:PutBucketEncryption",
            "s3:PutEncryptionConfiguration",
            "s3:GetBucketEncryption",
            "s3:GetEncryptionConfiguration",
            "s3:PutPublicAccessBlock",
            "s3:GetPublicAccessBlock",
            "s3:PutBucketTagging",
            "s3:GetBucketTagging",
            "s3:PutBucketPolicy",
            "s3:GetBucketPolicy",
            "s3:DeleteBucketPolicy",
            "s3:GetBucketLocation"
          ],
          resources: [ `arn:aws:s3:::${ id }-*` ]
        }),
        // IAM pass role for CloudFormation to use execution roles
        // Allows passing CDK cfn-exec-role and platform-prefixed roles to CloudFormation
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [ "iam:PassRole" ],
          resources: [
            `arn:aws:iam::${ t.account }:role/cdk-hnb659fds-cfn-exec-role-${ t.account }-${ t.region }`,
            `arn:aws:iam::${ t.account }:role/${ id }-*`
          ],
          conditions: {
            StringEquals: {
              "iam:PassedToService": "cloudformation.amazonaws.com"
            }
          }
        })
      ]
    })
  }

  private canInvokeCallback(id: string): iam.PolicyDocument {
    const h = this.host()
    const t = this.target()

    // Allow invoking the callback Lambda in the host (platform) account
    // This is used by EventBridge rules to send CloudFormation event callbacks
    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [ "lambda:InvokeFunction" ],
          resources: [ `arn:aws:lambda:*:${ h.account }:function:*-EventBridgeCallback` ]
        }),
        // Allow passing this role to EventBridge for cross-account Lambda invocation
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [ "iam:PassRole" ],
          resources: [ this.role.roleArn ],
          conditions: {
            StringEquals: {
              "iam:PassedToService": "events.amazonaws.com"
            }
          }
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
      roleArn: self.roleArn,
      releases: self.releases
    }
  }
}

