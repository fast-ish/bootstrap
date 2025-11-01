import * as iam from "aws-cdk-lib/aws-iam"
import { Role } from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs"

export class CdkDruidExecRoleConstruct extends Construct {
  public role: Role

  constructor(scope: Construct, id: string) {
    super(scope, id + "-cdk-druid-exec-role")

    const t = this.target()
    const name = `${ id }-${ t.name }-druid-exec`

    this.role = new iam.Role(this, name, {
      roleName: name,
      assumedBy: new iam.ServicePrincipal("cloudformation.amazonaws.com")
    })

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-druid-exec-can-operate-cloudformation-resources-policy`, {
        policyName: `${ id }-druid-exec-can-operate-cloudformation-resources`,
        roles: [ this.role ],
        document: this.operateCloudFormationResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-druid-exec-can-operate-cloudwatch-resources-policy`, {
        policyName: `${ id }-druid-exec-can-operate-cloudwatch-resources`,
        roles: [ this.role ],
        document: this.operateCloudWatchResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-druid-exec-can-operate-cloudwatch-logs-resources-policy`, {
        policyName: `${ id }-druid-exec-can-operate-cloudwatch-logs-resources`,
        roles: [ this.role ],
        document: this.operateCloudWatchLogsResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-druid-exec-can-operate-ec2-resources-policy`, {
        policyName: `${ id }-druid-exec-can-operate-ec2-resources`,
        roles: [ this.role ],
        document: this.operateEc2Resources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-druid-exec-can-operate-eks-resources-policy`, {
        policyName: `${ id }-druid-exec-can-operate-eks-resources`,
        roles: [ this.role ],
        document: this.operateEksResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-druid-exec-can-operate-events-bridge-resources-policy`, {
        policyName: `${ id }-druid-exec-can-operate-events-bridge-resources`,
        roles: [ this.role ],
        document: this.operateEventBridgeResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-druid-exec-can-operate-iam-resources-policy`, {
        policyName: `${ id }-druid-exec-can-operate-iam-resources`,
        roles: [ this.role ],
        document: this.operateIamResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-druid-exec-can-operate-kms-resources-policy`, {
        policyName: `${ id }-druid-exec-can-operate-kms-resources`,
        roles: [ this.role ],
        document: this.operateKmsResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-druid-exec-can-operate-lambda-resources-policy`, {
        policyName: `${ id }-druid-exec-can-operate-lambda-resources`,
        roles: [ this.role ],
        document: this.operateLambdaResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-druid-exec-can-operate-msk-resources-policy`, {
        policyName: `${ id }-druid-exec-can-operate-msk-resources`,
        roles: [ this.role ],
        document: this.operateMskResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-druid-exec-can-operate-rds-resources-policy`, {
        policyName: `${ id }-druid-exec-can-operate-rds-resources`,
        roles: [ this.role ],
        document: this.operateRdsResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-druid-exec-can-operate-s3-resources-policy`, {
        policyName: `${ id }-druid-exec-can-operate-s3-resources`,
        roles: [ this.role ],
        document: this.operateS3Resources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-druid-exec-can-operate-secretsmanager-resources-policy`, {
        policyName: `${ id }-druid-exec-can-operate-secretsmanager-resources`,
        roles: [ this.role ],
        document: this.operateSecretsManagerResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-druid-exec-can-operate-sqs-resources-policy`, {
        policyName: `${ id }-druid-exec-can-operate-sqs-resources`,
        roles: [ this.role ],
        document: this.operateSqsResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-druid-exec-can-operate-ssm-resources-policy`, {
        policyName: `${ id }-druid-exec-can-operate-ssm-resources`,
        roles: [ this.role ],
        document: this.operateSsmResources()
      }))

    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-druid-exec-can-operate-stepfn-resources-policy`, {
        policyName: `${ id }-druid-exec-can-operate-stepfn-resources`,
        roles: [ this.role ],
        document: this.operateStepFnResources()
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
            "ec2:ModifyVpcAttribute",
            "ec2:AssociateRouteTable",
            "ec2:AttachInternetGateway",
            "ec2:AuthorizeSecurityGroupEgress",
            "ec2:AllocateAddress",
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
            "ec2:RevokeSecurityGroupEgress",
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

  private operateEksResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "eks:CreateAccessEntry",
            "eks:CreateAddon",
            "eks:CreateCluster",
            "eks:CreateEksAnywhereSubscription",
            "eks:CreateFargateProfile",
            "eks:CreateNodegroup",
            "eks:CreatePodIdentityAssociation",
            "eks:AccessKubernetesApi",
            "eks:AssociateAccessPolicy",
            "eks:AssociateEncryptionConfig",
            "eks:AssociateIdentityProviderConfig",
            "eks:RegisterCluster",
            "eks:TagResource",
            "eks:DescribeAccessEntry",
            "eks:DescribeAddon",
            "eks:DescribeAddonConfiguration",
            "eks:DescribeAddonVersions",
            "eks:DescribeCluster",
            "eks:DescribeEksAnywhereSubscription",
            "eks:DescribeFargateProfile",
            "eks:DescribeIdentityProviderConfig",
            "eks:DescribeInsight",
            "eks:DescribeNodegroup",
            "eks:DescribePodIdentityAssociation",
            "eks:DescribeUpdate",
            "eks:ListAccessEntries",
            "eks:ListAccessPolicies",
            "eks:ListAddons",
            "eks:ListAssociatedAccessPolicies",
            "eks:ListClusters",
            "eks:ListEksAnywhereSubscriptions",
            "eks:ListFargateProfiles",
            "eks:ListIdentityProviderConfigs",
            "eks:ListInsights",
            "eks:ListNodegroups",
            "eks:ListPodIdentityAssociations",
            "eks:ListTagsForResource",
            "eks:ListUpdates",
            "eks:UpdateAccessEntry",
            "eks:UpdateAddon",
            "eks:UpdateClusterConfig",
            "eks:UpdateClusterVersion",
            "eks:UpdateEksAnywhereSubscription",
            "eks:UpdateNodegroupConfig",
            "eks:UpdateNodegroupVersion",
            "eks:UpdatePodIdentityAssociation",
            "eks:UntagResource",
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
            "events:PutRule",
            "events:PutTargets",
            "events:TagResource",
            "events:DescribeRule",
            "events:ListTargetsByRule",
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
            "iam:CreateRole",
            "iam:CreateServiceLinkedRole",
            "iam:AttachRolePolicy",
            "iam:TagRole",
            "iam:TagUser",
            "iam:TagGroup",
            "iam:TagPolicy",
            "iam:GetRole",
            "iam:ListRolePolicies",
            "iam:ListAttachedRolePolicies",
            "iam:GetRolePolicy",
            "iam:PutRolePolicy",
            "iam:DeleteRole",
            "iam:DeleteRolePolicy",
            "iam:DetachRolePolicy"
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
            "kms:CreateKey",
            "kms:CreateAlias",
            "kms:CreateGrant",
            "kms:GenerateDataKey",
            "kms:GenerateDataKeyWithoutPlaintext",
            "kms:Encrypt",
            "kms:Decrypt",
            "kms:ReEncrypt",
            "kms:EnableKey",
            "kms:EnableKeyRotation",
            "kms:RetireGrant",
            "kms:PutKeyPolicy",
            "kms:TagResource",
            "kms:ListKeys",
            "kms:DescribeKey",
            "kms:ListAliases",
            "kms:GetKeyPolicy",
            "kms:GetKeyRotationStatus",
            "kms:ListGrants",
            "kms:ListRetirableGrants",
            "kms:UpdateKeyDescription",
            "kms:UpdateAlias",
            "kms:DisableKeyRotation",
            "kms:DisableKey",
            "kms:DeleteKey",
            "kms:DeleteAlias",
            "kms:DeleteKeyPolicy",
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
            "lambda:CreateCodeSigningConfig",
            "lambda:CreateEventSourceMapping",
            "lambda:CreateFunction",
            "lambda:AddPermission",
            "lambda:PublishLayerVersion",
            "lambda:InvokeFunction",
            "lambda:TagResource",
            "lambda:GetCodeSigningConfig",
            "lambda:GetEventSourceMapping",
            "lambda:GetFunction",
            "lambda:GetFunctionCodeSigningConfig",
            "lambda:GetLayerVersion",
            "lambda:GetRuntimeManagementConfig",
            "lambda:DeleteFunction",
            "lambda:DeleteLayerVersion"
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
            "kafka:BatchAssociateScramSecret",
            "kafka:CreateCluster",
            "kafka:CreateClusterV2",
            "kafka:CreateConfiguration",
            "kafka:CreateReplicator",
            "kafka:CreateVpcConnection",
            "kafka:PutClusterPolicy",
            "kafka:RebootBroker",
            "kafka:RejectClientVpcConnection",
            "kafka:TagResource",
            "kafka:DescribeCluster",
            "kafka:DescribeClusterOperation",
            "kafka:DescribeClusterOperationV2",
            "kafka:DescribeClusterV2",
            "kafka:DescribeConfiguration",
            "kafka:DescribeConfigurationRevision",
            "kafka:DescribeReplicator",
            "kafka:DescribeVpcConnection",
            "kafka:GetBootstrapBrokers",
            "kafka:GetClusterPolicy",
            "kafka:GetCompatibleKafkaVersions",
            "kafka:ListClientVpcConnections",
            "kafka:ListClusterOperations",
            "kafka:ListClusterOperationsV2",
            "kafka:ListClusters",
            "kafka:ListClustersV2",
            "kafka:ListConfigurationRevisions",
            "kafka:ListConfigurations",
            "kafka:ListKafkaVersions",
            "kafka:ListNodes",
            "kafka:ListReplicators",
            "kafka:ListScramSecrets",
            "kafka:ListTagsForResource",
            "kafka:ListVpcConnections",
            "kafka:DeleteCluster"
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
            "rds:Add*",
            "rds:AuthorizeDBSecurityGroupIngress",
            "rds:BacktrackDBCluster",
            "rds:Copy*",
            "rds:Create*",
            "rds:Describe*",
            "rds:Start*",
            "rds:EnableHttpEndpoint",
            "rds:FailoverDBCluster",
            "rds:FailoverGlobalCluster",
            "rds:ListTagsForResource",
            "rds:DeleteDBInstance",
            "rds:DeleteDBCluster"
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
            "s3:ObjectOwnerOverrideToBucketOwner",
            "s3:Put*",
            "s3:SubmitMultiRegionAccessPointRoutes",
            "s3:TagResource",
            "s3:Get*",
            "s3:DescribeJob",
            "s3:DescribeMultiRegionAccessPointOperation",
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

  private operateSecretsManagerResources(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "secretsmanager:CreateSecret",
            "secretsmanager:PutResourcePolicy",
            "secretsmanager:PutSecretValue",
            "secretsmanager:ValidateResourcePolicy",
            "secretsmanager:RemoveRegionsFromReplication",
            "secretsmanager:ReplicateSecretToRegions",
            "secretsmanager:TagResource",
            "secretsmanager:DescribeSecret",
            "secretsmanager:GetRandomPassword",
            "secretsmanager:GetResourcePolicy",
            "secretsmanager:GetSecretValue",
            "secretsmanager:ListSecretVersionIds",
            "secretsmanager:ListSecrets",
            "secretsmanager:DeleteSecret",
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
            "sqs:AddPermission",
            "sqs:ChangeMessageVisibility",
            "sqs:CreateQueue",
            "sqs:ReceiveMessage",
            "sqs:SendMessage",
            "sqs:SetQueueAttributes",
            "sqs:StartMessageMoveTask",
            "sqs:TagQueue",
            "sqs:GetQueueAttributes",
            "sqs:GetQueueUrl",
            "sqs:ListDeadLetterSourceQueues",
            "sqs:ListMessageMoveTasks",
            "sqs:ListQueueTags",
            "sqs:ListQueues",
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
            "ssm:PutParameter",
            "ssm:PutParameters",
            "ssm:GetParameters",
            "ssm:AddTagsToResource",
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
            "states:CreateStateMachine",
            "states:DescribeStateMachine",
            "states:TagResource",
            "states:DeleteStateMachine"
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

