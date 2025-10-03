import * as iam from "aws-cdk-lib/aws-iam"
import { Role } from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs"

export class CdkWebappExecRoleConstruct extends Construct {
  public role: Role

  constructor(scope: Construct, id: string) {
    super(scope, id + "-cdk-webapp-exec-role")

    const t = this.target()
    const name = `${ id }-${ t.name }-webapp-exec`

    this.role = new iam.Role(this, name, {
      roleName: name,
      assumedBy: new iam.ServicePrincipal("cloudformation.amazonaws.com")
    })

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-webapp-exec-can-operate-cloudformation-resources-policy`, {
        policyName: `${ id }-webapp-exec-can-operate-cloudformation-resources`,
        roles: [ this.role ],
        document: this.operateCloudFormationResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-webapp-exec-can-operate-cloudwatch-resources-policy`, {
        policyName: `${ id }-webapp-exec-can-operate-cloudwatch-resources`,
        roles: [ this.role ],
        document: this.operateCloudWatchResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-webapp-exec-can-operate-cloudwatch-logs-resources-policy`, {
        policyName: `${ id }-webapp-exec-can-operate-cloudwatch-logs-resources`,
        roles: [ this.role ],
        document: this.operateCloudWatchLogsResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-webapp-exec-can-operate-ec2-resources-policy`, {
        policyName: `${ id }-webapp-exec-can-operate-ec2-resources`,
        roles: [ this.role ],
        document: this.operateEc2Resources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-webapp-exec-can-operate-ses-resources-policy`, {
        policyName: `${ id }-webapp-exec-can-operate-ses-resources`,
        roles: [ this.role ],
        document: this.operateSesResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-webapp-exec-can-operate-route53-resources-policy`, {
        policyName: `${ id }-webapp-exec-can-operate-route53-resources`,
        roles: [ this.role ],
        document: this.operateRoute53Resources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-webapp-exec-can-operate-iam-resources-policy`, {
        policyName: `${ id }-webapp-exec-can-operate-iam-resources`,
        roles: [ this.role ],
        document: this.operateIamResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-webapp-exec-can-operate-lambda-resources-policy`, {
        policyName: `${ id }-webapp-exec-can-operate-lambda-resources`,
        roles: [ this.role ],
        document: this.operateLambdaResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-webapp-exec-can-operate-s3-resources-policy`, {
        policyName: `${ id }-webapp-exec-can-operate-s3-resources`,
        roles: [ this.role ],
        document: this.operateS3Resources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-webapp-exec-can-operate-signer-resources-policy`, {
        policyName: `${ id }-webapp-exec-can-operate-signer-resources`,
        roles: [ this.role ],
        document: this.operateSignerResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-webapp-exec-can-operate-cognito-userpool-resources-policy`, {
        policyName: `${ id }-webapp-exec-can-operate-cognito-userpool-resources`,
        roles: [ this.role ],
        document: this.operateCognitoUserPoolResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-webapp-exec-can-operate-sns-resources-policy`, {
        policyName: `${ id }-webapp-exec-can-operate-sns-resources`,
        roles: [ this.role ],
        document: this.operateSnsResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-webapp-exec-can-operate-dynamodb-resources-policy`, {
        policyName: `${ id }-webapp-exec-can-operate-dynamodb-resources`,
        roles: [ this.role ],
        document: this.operateDynamoDbResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-webapp-exec-can-operate-kms-resources-policy`, {
        policyName: `${ id }-webapp-exec-can-operate-kms-resources`,
        roles: [ this.role ],
        document: this.operateKmsResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-webapp-exec-can-operate-apigw-resources-policy`, {
        policyName: `${ id }-webapp-exec-can-operate-apigw-resources`,
        roles: [ this.role ],
        document: this.operateApiGatewayResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-webapp-exec-can-operate-pinpoint-sms-resources-policy`, {
        policyName: `${ id }-webapp-exec-can-operate-pinpoint-sms-resources`,
        roles: [ this.role ],
        document: this.operatePinpointSmsResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-webapp-exec-can-operate-ssm-resources-policy`, {
        policyName: `${ id }-webapp-exec-can-operate-ssm-resources`,
        roles: [ this.role ],
        document: this.operateSsmResources()
      }))
  }

  private operateCloudFormationResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "cloudformation:CreateStack",
            "cloudformation:CreateChangeSet",
            "cloudformation:ExecuteChangeSet",
            "cloudformation:DescribeChangeSet",
            "cloudformation:DescribeStacks",
            "cloudformation:DescribeStackEvents",
            "cloudformation:GetTemplate",
            "cloudformation:GetTemplateSummary",
            "cloudformation:UpdateStack",
            "cloudformation:UpdateTerminationProtection",
            "cloudformation:DeleteStack",
            "cloudformation:DeleteChangeSet",
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
            "logs:CreateLogGroup",
            "logs:PutRetentionPolicy",
            "logs:DescribeLogGroups",
            "logs:TagResource",
            "logs:DeleteLogGroup",
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
            "cloudwatch:TagResource",
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
            "ec2:CreateInternetGateway",
            "ec2:CreateNatGateway",
            "ec2:CreateRoute",
            "ec2:CreateRouteTable",
            "ec2:CreateSecurityGroup",
            "ec2:CreateSubnet",
            "ec2:CreateVpc",
            "ec2:CreateVpcEndpoint",
            "ec2:CreateTags",
            "ec2:DescribeAddresses",
            "ec2:DescribeAvailabilityZones",
            "ec2:DescribeInternetGateways",
            "ec2:DescribeNetworkAcls",
            "ec2:DescribeNetworkInterfaces",
            "ec2:DescribeNatGateways",
            "ec2:DescribeRouteTables",
            "ec2:DescribeSecurityGroups",
            "ec2:DescribeSubnets",
            "ec2:DescribeVpcs",
            "ec2:DescribeVpcAttribute",
            "ec2:DescribeVpcEndpoints",
            "ec2:ModifyVpcAttribute",
            "ec2:AssociateRouteTable",
            "ec2:AttachInternetGateway",
            "ec2:AuthorizeSecurityGroupEgress",
            "ec2:RevokeSecurityGroupEgress",
            "ec2:AllocateAddress",
            "ec2:ReleaseAddress",
            "ec2:DeleteSecurityGroup",
            "ec2:DeleteSubnet",
            "ec2:DisassociateRouteTable"
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
            "ses:CreateReceiptRuleSet",
            "ses:CreateConfigurationSet",
            "ses:CreateEmailIdentity",
            "ses:CreateReceiptRule",
            "ses:PutEmailIdentityMailFromAttributes",
            "ses:PutEmailIdentityFeedbackAttributes",
            "ses:GetEmailIdentity",
            "ses:GetConfigurationSet",
            "ses:DeleteConfigurationSet",
            "ses:DeleteEmailIdentity",
            "ses:DeleteReceiptRuleSet",
            "ses:DeleteReceiptRule",
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
            "route53:GetChange",
            "route53:ChangeResourceRecordSets",
            "route53:GetHostedZone",
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
          actions: [ "iam:PassRole" ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "iam:CreateRole",
            "iam:AttachRolePolicy",
            "iam:CreateServiceLinkedRole",
            "iam:GetRole",
            "iam:ListRolePolicies",
            "iam:ListAttachedRolePolicies",
            "iam:PutRolePolicy",
            "iam:GetRolePolicy",
            "iam:TagRole",
            "iam:TagUser",
            "iam:TagGroup",
            "iam:TagPolicy",
            "iam:DeleteRole",
            "iam:DeleteRolePolicy",
            "iam:DetachRolePolicy"
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
            "lambda:AddPermission",
            "lambda:CreateCodeSigningConfig",
            "lambda:CreateEventSourceMapping",
            "lambda:CreateFunction",
            "lambda:InvokeFunction",
            "lambda:GetCodeSigningConfig",
            "lambda:GetEventSourceMapping",
            "lambda:GetFunction",
            "lambda:GetFunctionCodeSigningConfig",
            "lambda:GetLayerVersion",
            "lambda:GetRuntimeManagementConfig",
            "lambda:PublishLayerVersion",
            "lambda:UpdateFunction",
            "lambda:UpdateFunctionCode",
            "lambda:UpdateFunctionConfiguration",
            "lambda:ListTags",
            "lambda:TagResource",
            "lambda:RemovePermission",
            "lambda:DeleteFunction",
            "lambda:DeleteLayerVersion",
            "lambda:DeleteCodeSigningConfig",
            "lambda:DeleteEventSourceMapping",
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
            "s3:AbortMultipartUpload",
            "s3:AssociateAccessGrantsIdentityCenter",
            "s3:BypassGovernanceRetention",
            "s3:Create*",
            "s3:SubmitMultiRegionAccessPointRoutes",
            "s3:DescribeJob",
            "s3:DescribeMultiRegionAccessPointOperation",
            "s3:Get*",
            "s3:ListAccessGrants",
            "s3:ListAccessGrantsInstances",
            "s3:ListAccessGrantsLocations",
            "s3:ListAccessPoints",
            "s3:ListAccessPointsForObjectLambda",
            "s3:ListAllMyBuckets",
            "s3:ListBucket",
            "s3:ListBucketMultipartUploads",
            "s3:ListBucketVersions",
            "s3:ListJobs",
            "s3:ListMultiRegionAccessPoints",
            "s3:ListMultipartUploadParts",
            "s3:ListStorageLensConfigurations",
            "s3:ListStorageLensGroups",
            "s3:ListTagsForResource",
            "s3:ObjectOwnerOverrideToBucketOwner",
            "s3:Put*",
            "s3:TagResource",
            "s3:DeleteBucket",
            "s3:DeleteBucketPolicy"
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
            "signer:GetSigningProfile",
            "signer:CancelSigningProfile",
            "signer:PutSigningProfile",
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
            "cognito-idp:CreateGroup",
            "cognito-idp:CreateUserPoolClient",
            "cognito-idp:CreateUserPool",
            "cognito-idp:SetUserPoolMfaConfig",
            "cognito-idp:GetGroup",
            "cognito-idp:GetUserPoolMfaConfig",
            "cognito-idp:DescribeUserPool",
            "cognito-idp:TagResource",
            "cognito-idp:ListTagsForResource",
            "cognito-idp:DeleteUserPool",
            "cognito-idp:DeleteUserPoolClient",
            "cognito-idp:DeleteGroup",
            "cognito-idp:UntagResource",
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
            "sns:AddPermission",
            "sns:CheckIfPhoneNumberIsOptedOut",
            "sns:ConfirmSubscription",
            "sns:CreatePlatformApplication",
            "sns:CreatePlatformEndpoint",
            "sns:CreateSMSSandboxPhoneNumber",
            "sns:CreateTopic",
            "sns:GetEndpointAttributes",
            "sns:GetPlatformApplicationAttributes",
            "sns:GetSMSAttributes",
            "sns:GetSMSSandboxAccountStatus",
            "sns:GetSubscriptionAttributes",
            "sns:GetTopicAttributes",
            "sns:ListEndpointsByPlatformApplication",
            "sns:ListOriginationNumbers",
            "sns:ListPhoneNumbersOptedOut",
            "sns:ListPlatformApplications",
            "sns:ListSMSSandboxPhoneNumbers",
            "sns:ListSubscriptions",
            "sns:ListSubscriptionsByTopic",
            "sns:ListTagsForResource",
            "sns:ListTopics",
            "sns:OptInPhoneNumber",
            "sns:Publish",
            "sns:RemovePermission",
            "sns:SetEndpointAttributes",
            "sns:SetPlatformApplicationAttributes",
            "sns:SetSMSAttributes",
            "sns:SetSubscriptionAttributes",
            "sns:SetTopicAttributes",
            "sns:Subscribe",
            "sns:TagResource",
            "sns:DeleteEndpoint",
            "sns:DeletePlatformApplication",
            "sns:DeleteSMSSandboxPhoneNumber",
            "sns:DeleteTopic",
            "sns:UntagResource",
            "sns:Unsubscribe",
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
            "dynamodb:CreateTable",
            "dynamodb:TagResource",
            "dynamodb:DescribeTable",
            "dynamodb:GetResourcePolicy",
            "dynamodb:DescribeTimeToLive",
            "dynamodb:DescribeKinesisStreamingDestination",
            "dynamodb:DescribeContributorInsights",
            "dynamodb:DescribeContinuousBackups",
            "dynamodb:ListTagsOfResource",
            "dynamodb:UpdateContributorInsights",
            "dynamodb:DeleteTable",
          ],
          resources: [ "*" ],
          conditions: {
            StringEquals: { "aws:PrincipalAccount": t.account },
          },
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "application-autoscaling:DeregisterScalableTarget"
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

  private operateKmsResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "kms:CreateGrant",
            "kms:Encrypt",
            "kms:Decrypt",
            "kms:DescribeKey",
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
            "apigateway:GET",
            "apigateway:PUT",
            "apigateway:POST",
            "apigateway:PATCH",
            "apigateway:DELETE"
          ],
          resources: [ "*" ],
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
            "sms-voice-v2:DescribeAccountAttributes"
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
            "ssm:GetParameters"
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
