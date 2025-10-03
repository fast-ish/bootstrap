import * as iam from "aws-cdk-lib/aws-iam"
import { Role } from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs"

export class CdkImagesRoleConstruct extends Construct {
  public role: Role

  constructor(scope: Construct, id: string) {
    super(scope, id + "-cdk-images-role")

    const t = this.target()
    const name = `${ id }-${ t.name }-images`

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
      new iam.Policy(scope, `${ id }-images-can-operate-kms-resources-policy`, {
        policyName: `${ id }-images-can-operate-kms-resources`,
        roles: [ this.role ],
        document: this.operateEcrResources(id)
      }))
  }

  private operateEcrResources(id: string): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "ecr:BatchCheckLayerAvailability",
            "ecr:BatchGetImage",
            "ecr:CompleteLayerUpload",
            "ecr:DescribeImages",
            "ecr:DescribeRepositories",
            "ecr:GetDownloadUrlForLayer",
            "ecr:InitiateLayerUpload",
            "ecr:PutImage",
            "ecr:UploadLayerPart",
          ],
          resources: [
            `arn:aws:ecr:${ t.region }:${ t.account }:repository/${ id }-${ t.name }`,
          ],
          conditions: {
            StringEquals: {
              "aws:PrincipalAccount": t.account,
            },
          },
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [ "ecr:GetAuthorizationToken" ],
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

