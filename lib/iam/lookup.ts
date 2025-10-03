import * as iam from "aws-cdk-lib/aws-iam"
import { Role } from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs"

export class CdkLookupRoleConstruct extends Construct {
  public role: Role

  constructor(scope: Construct, id: string) {
    super(scope, id + "-cdk-lookup-role")

    const t = this.target()
    const name = `${ id }-${ t.name }-lookup`

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

    this.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("ReadOnlyAccess"));
    
    this.role.attachInlinePolicy(
      new iam.Policy(scope, `${ id }-lookup-can-operate-kms-resources-policy`, {
        policyName: `${ id }-lookup-can-operate-kms-resources`,
        roles: [ this.role ],
        document: this.kmsDenyPolicy()
      }))
  }

  private kmsDenyPolicy(): iam.PolicyDocument {
    const t = this.target()

    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.DENY,
          actions: [ "kms:Decrypt" ],
          resources: [ "*" ],
          conditions: {
            "StringEquals": {
              "aws:PrincipalAccount": t.account
            }
          }
        })
      ]
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

