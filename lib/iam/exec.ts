import * as iam from "aws-cdk-lib/aws-iam"
import { Role } from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs"

export class CdkExecRoleConstruct extends Construct {
  public role: Role

  constructor(scope: Construct, id: string) {
    super(scope, id + "-cdk-exec-role")

    const t = this.target()
    const name = `${ id }-${ t.name }-exec`

    this.role = new iam.Role(this, name, {
      roleName: name,
      assumedBy: new iam.ServicePrincipal("cloudformation.amazonaws.com")
    })

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-cloudformation-resources-policy`, {
        policyName: `${ id }-exec-can-operate-cloudformation-resources`,
        roles: [ this.role ],
        document: this.operateCloudFormationResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-cloudwatch-resources-policy`, {
        policyName: `${ id }-exec-can-operate-cloudwatch-resources`,
        roles: [ this.role ],
        document: this.operateCloudWatchResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-cloudwatch-logs-resources-policy`, {
        policyName: `${ id }-exec-can-operate-cloudwatch-logs-resources`,
        roles: [ this.role ],
        document: this.operateCloudWatchLogsResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-ec2-resources-policy`, {
        policyName: `${ id }-exec-can-operate-ec2-resources`,
        roles: [ this.role ],
        document: this.operateEc2Resources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-eks-resources-policy`, {
        policyName: `${ id }-exec-can-operate-eks-resources`,
        roles: [ this.role ],
        document: this.operateEksResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-events-bridge-resources-policy`, {
        policyName: `${ id }-exec-can-operate-events-bridge-resources`,
        roles: [ this.role ],
        document: this.operateEventBridgeResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-iam-resources-policy`, {
        policyName: `${ id }-exec-can-operate-iam-resources`,
        roles: [ this.role ],
        document: this.operateIamResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-kms-resources-policy`, {
        policyName: `${ id }-exec-can-operate-kms-resources`,
        roles: [ this.role ],
        document: this.operateKmsResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-lambda-resources-policy`, {
        policyName: `${ id }-exec-can-operate-lambda-resources`,
        roles: [ this.role ],
        document: this.operateLambdaResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-msk-resources-policy`, {
        policyName: `${ id }-exec-can-operate-msk-resources`,
        roles: [ this.role ],
        document: this.operateMskResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-apigw-resources-policy`, {
        policyName: `${ id }-exec-can-operate-apigw-resources`,
        roles: [ this.role ],
        document: this.operateApiGatewayResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-rds-resources-policy`, {
        policyName: `${ id }-exec-can-operate-rds-resources`,
        roles: [ this.role ],
        document: this.operateRdsResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-s3-resources-policy`, {
        policyName: `${ id }-exec-can-operate-s3-resources`,
        roles: [ this.role ],
        document: this.operateS3Resources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-secretsmanager-resources-policy`, {
        policyName: `${ id }-exec-can-operate-secretsmanager-resources`,
        roles: [ this.role ],
        document: this.operateSecretsManagerResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-sqs-resources-policy`, {
        policyName: `${ id }-exec-can-operate-sqs-resources`,
        roles: [ this.role ],
        document: this.operateSqsResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-ssm-resources-policy`, {
        policyName: `${ id }-exec-can-operate-ssm-resources`,
        roles: [ this.role ],
        document: this.operateSsmResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-stepfn-resources-policy`, {
        policyName: `${ id }-exec-can-operate-stepfn-resources`,
        roles: [ this.role ],
        document: this.operateStepFnResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-ses-resources-policy`, {
        policyName: `${ id }-exec-can-operate-ses-resources`,
        roles: [ this.role ],
        document: this.operateSesResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-route53-resources-policy`, {
        policyName: `${ id }-exec-can-operate-route53-resources`,
        roles: [ this.role ],
        document: this.operateRoute53Resources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-signer-resources-policy`, {
        policyName: `${ id }-exec-can-operate-signer-resources`,
        roles: [ this.role ],
        document: this.operateSignerResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-cognito-userpool-resources-policy`, {
        policyName: `${ id }-exec-can-operate-cognito-userpool-resources`,
        roles: [ this.role ],
        document: this.operateCognitoUserPoolResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-sns-resources-policy`, {
        policyName: `${ id }-exec-can-operate-sns-resources`,
        roles: [ this.role ],
        document: this.operateSnsResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-dynamodb-resources-policy`, {
        policyName: `${ id }-exec-can-operate-dynamodb-resources`,
        roles: [ this.role ],
        document: this.operateDynamoDbResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-exec-can-operate-pinpoint-sms-resources-policy`, {
        policyName: `${ id }-exec-can-operate-pinpoint-sms-resources`,
        roles: [ this.role ],
        document: this.operatePinpointSmsResources()
      }))
  }

  private operateCloudFormationResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "cloudformation:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateCloudWatchLogsResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "logs:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateCloudWatchResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "cloudwatch:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateEc2Resources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "ec2:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateEksResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "eks:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateEventBridgeResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "events:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateIamResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "iam:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [ "iam:PassRole" ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateKmsResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "kms:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateLambdaResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "lambda:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateMskResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "kafka:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateApiGatewayResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "apigateway:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateRdsResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "rds:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateS3Resources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "s3:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateSecretsManagerResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "secretsmanager:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateSqsResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "sqs:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateSsmResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "ssm:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateStepFnResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "states:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateSesResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "ses:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateRoute53Resources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "route53:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateSignerResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "signer:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateCognitoUserPoolResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "cognito-idp:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateSnsResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "sns:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operateDynamoDbResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "dynamodb:*",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "application-autoscaling:*"
          ],
          resources: [
            "arn:aws:application-autoscaling:*:*:scalable-target/*",
            "arn:aws:application-autoscaling:*:*:scaling-policy/*"
          ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
      ],
    })
  }

  private operatePinpointSmsResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "sms-voice-v2:*"
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
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
