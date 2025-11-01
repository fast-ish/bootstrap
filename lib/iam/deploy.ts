import * as iam from "aws-cdk-lib/aws-iam"
import { Role } from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs"

export class CdkDeployRoleConstruct extends Construct {
  public role: Role

  constructor(scope: Construct, id: string) {
    super(scope, id + "-cdk-deploy-role")

    const t = this.target()
    const name = `${ id }-${ t.name }-deploy`

    this.role = new iam.Role(this, name, {
      roleName: name,
      assumedBy: new iam.PrincipalWithConditions(
        new iam.AccountRootPrincipal(), {
          StringEquals: {
            "sts:ExternalId": t.externalId,
            "aws:PrincipalAccount": t.account
          }
        })
    })

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-deploy-can-create-iam-resources-policy`, {
        policyName: `${ id }-deploy-can-create-iam-resources`,
        roles: [ this.role ],
        document: this.operateIamResources(id)
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-deploy-can-create-sts-resources-policy`, {
        policyName: `${ id }-deploy-can-create-sts-resources`,
        roles: [ this.role ],
        document: this.operateStsResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-deploy-can-create-ssm-resources-policy`, {
        policyName: `${ id }-deploy-can-create-ssm-resources`,
        roles: [ this.role ],
        document: this.operateSsmResources(id)
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-deploy-can-create-secretsmanager-resources-policy`, {
        policyName: `${ id }-deploy-can-create-secretsmanager-resources`,
        roles: [ this.role ],
        document: this.operateSecretsManagerResources(id)
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-deploy-can-create-s3-resources-policy`, {
        policyName: `${ id }-deploy-can-create-s3-resources`,
        roles: [ this.role ],
        document: this.operateS3Resources(id)
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-deploy-can-create-kms-resources-policy`, {
        policyName: `${ id }-deploy-can-create-kms-resources`,
        roles: [ this.role ],
        document: this.operateKmsResources(id)
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-deploy-can-create-cloudformation-resources-policy`, {
        policyName: `${ id }-deploy-can-create-cloudformation-resources`,
        roles: [ this.role ],
        document: this.operateCloudFormationResources()
      }))
  }

  private operateIamResources(id: string): iam.PolicyDocument {
    const t = this.target()

    const principals = []
    if (t.releases.includes("all"))
      principals.push(`arn:aws:iam::${ t.account }:role/${ id }-${ t.name }-exec`)
    if (t.releases.includes("druid"))
      principals.push(`arn:aws:iam::${ t.account }:role/${ id }-${ t.name }-druid-exec`)
    if (t.releases.includes("webapp"))
      principals.push(`arn:aws:iam::${ t.account }:role/${ id }-${ t.name }-webapp-exec`)

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "iam:PassRole"
          ],
          resources: principals,
          conditions: {
            StringEquals: {
              "aws:PrincipalAccount": t.account,
            },
          },
        }),
      ],
    })
  }

  private operateStsResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "sts:GetCallerIdentity"
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: {
              "aws:PrincipalAccount": t.account,
            },
          },
        }),
      ],
    })
  }

  private operateSsmResources(id: string): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "ssm:GetParameter",
            "ssm:GetParameters"
          ],
          resources: [
            `arn:aws:ssm:${ t.region }:${ t.account }:parameter/cdk/${ id }-${ t.name }/version`,
          ],
          conditions: {
            StringEquals: {
              "aws:PrincipalAccount": t.account,
            },
          },
        }),
      ],
    })
  }

  private operateSecretsManagerResources(id: string): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "secretsmanager:GetResourcePolicy",
            "secretsmanager:GetSecretValue",
            "secretsmanager:DescribeSecret",
            "secretsmanager:ListSecretVersionIds",
          ],
          resources: [
            `arn:aws:secretsmanager:${ t.region }:${ t.account }:secret:${ id }*${ t.name }*`,
          ],
          conditions: {
            StringEquals: {
              "aws:PrincipalAccount": t.account,
            },
          },
        }),
      ],
    })
  }

  private operateS3Resources(id: string): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "s3:Abort*",
            "s3:DeleteObject*",
            "s3:GetBucket*",
            "s3:GetObject*",
            "s3:List*",
            "s3:PutObject*",
          ],
          resources: [
            `arn:aws:s3:::${ id }-${ t.name }`,
            `arn:aws:s3:::${ id }-${ t.name }/*`,
          ],
          conditions: {
            StringEquals: {
              "aws:PrincipalAccount": t.account,
            },
          },
        }),
      ],
    })
  }

  private operateKmsResources(id: string): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "kms:Decrypt",
            "kms:DescribeKey",
            "kms:Encrypt",
            "kms:GenerateDataKey*",
            "kms:ReEncrypt*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: {
              "kms:ViaService": `s3.${ t.region }.amazonaws.com`,
              "aws:PrincipalAccount": t.account,
              "kms:CallerAlias": `alias/${ id }-${ t.name }`,
            },
          },
        }),
      ],
    })
  }

  private operateCloudFormationResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "cloudformation:CreateChangeSet",
            "cloudformation:CreateStack",
            "cloudformation:DeleteChangeSet",
            "cloudformation:DeleteStack",
            "cloudformation:DescribeChangeSet",
            "cloudformation:DescribeStackEvents",
            "cloudformation:DescribeStacks",
            "cloudformation:ExecuteChangeSet",
            "cloudformation:GetTemplate",
            "cloudformation:GetTemplateSummary",
            "cloudformation:UpdateStack",
            "cloudformation:UpdateTerminationProtection",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: {
              "aws:PrincipalAccount": t.account,
            },
          },
        }),
      ],
    })
  }

  private target() {
    const subscriber = this.node.getContext("subscriber")

    return {
      account: subscriber.account,
      name: subscriber.name,
      region: subscriber.region,
      externalId: subscriber.externalId,
      subscriberRoleArn: subscriber.subscriberRoleArn,
      releases: subscriber.releases
    }
  }
}
