import * as iam from "aws-cdk-lib/aws-iam"
import { Role } from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs"

export class CdkAssetsRoleConstruct extends Construct {
  public role: Role

  constructor(scope: Construct, id: string) {
    super(scope, id + "-cdk-assets-role")

    const t = this.target()
    const name = `${ id }-${ t.name }-assets`

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
      new iam.Policy(scope, `${ id }-assets-can-operate-s3-resources-policy`, {
        policyName: `${ id }-assets-can-operate-s3-resources`,
        roles: [ this.role ],
        document: this.operateS3Resources(id)
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-assets-can-operate-kms-resources-policy`, {
        policyName: `${ id }-assets-can-operate-kms-resources`,
        roles: [ this.role ],
        document: this.kmsEncryption(id)
      }))
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
            "s3:GetEncryptionConfiguration",
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

  private kmsEncryption(id: string): iam.PolicyDocument {
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

  private target() {
    const synthesizer = this.node.getContext("synthesizer")

    return {
      account: synthesizer.account,
      name: synthesizer.name,
      region: synthesizer.region,
      externalId: synthesizer.externalId,
      subscriberRoleArn: synthesizer.subscriberRoleArn,
      releases: synthesizer.releases
    }
  }
}

