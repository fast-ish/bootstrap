import * as iam from "aws-cdk-lib/aws-iam"
import { Role } from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs"

export class CdkHandshakeRoleConstruct extends Construct {
  public role: Role

  constructor(scope: Construct, id: string) {
    super(scope, id + "-cdk-handshake-role")

    const t = this.target()
    const name = `${ id }-${ t.name }-handshake`

    this.role = new iam.Role(this, name, {
      roleName: name,
      assumedBy: new iam.PrincipalWithConditions(
        new iam.ArnPrincipal(t.subscriberRoleArn), {
          StringEquals: {
            "sts:ExternalId": t.externalId,
            "aws:PrincipalAccount": this.host().account
          }
        })
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
  }

  private canAssumeRoles(id: string): iam.PolicyDocument {
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
          actions: [ "sts:AssumeRole" ],
          resources: [
            `arn:aws:iam::${ t.account }:role/${ id }-${ t.name }-lookup`,
            `arn:aws:iam::${ t.account }:role/${ id }-${ t.name }-assets`,
            `arn:aws:iam::${ t.account }:role/${ id }-${ t.name }-images`,
            `arn:aws:iam::${ t.account }:role/${ id }-${ t.name }-deploy`,
            ...principals,
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
          actions: [ "iam:SimulatePrincipalPolicy" ],
          resources: [
            `arn:aws:iam::${ t.account }:role/${ id }-${ t.name }-lookup`,
            `arn:aws:iam::${ t.account }:role/${ id }-${ t.name }-assets`,
            `arn:aws:iam::${ t.account }:role/${ id }-${ t.name }-images`,
            `arn:aws:iam::${ t.account }:role/${ id }-${ t.name }-deploy`,
            ...principals,
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

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "s3:PutObject",
            "s3:GetEncryptionConfiguration",
            "s3:ListBucket",
            "s3:GetBucketLocation"
          ],
          resources: [
            `arn:aws:s3:::${ id }-${ t.name }`,
            `arn:aws:s3:::${ id }-${ t.name }/*`
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

  private host() {
    return {
      account: this.node.getContext("host")?.account,
    }
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

