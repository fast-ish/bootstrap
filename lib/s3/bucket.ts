import * as s3 from "aws-cdk-lib/aws-s3"
import { Bucket, ObjectOwnership } from "aws-cdk-lib/aws-s3"
import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib/core"
import * as iam from "aws-cdk-lib/aws-iam"

// S3 bucket construct for storing deployment assets and artifacts
// Configured with security best practices including encryption and access controls
export class AssetsBucket extends Construct {
  public bucket: Bucket

  constructor(scope: Construct, id: string) {
    super(scope, id + "-assets-bucket")

    const t = this.target()
    const name = `${ id }-${ t.name.toLowerCase() }`

    // Create S3 bucket with security best practices
    this.bucket = new s3.Bucket(this, name, {
      bucketName: name,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,     // Block all public access
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED, // Ensure bucket owner has full control
    })

    // Enforce HTTPS-only access to the bucket
    // Denies any requests that don't use SSL/TLS
    const bucketPolicy = new iam.PolicyStatement({
      sid: `${ name }-ownership`,
      effect: iam.Effect.DENY,
      actions: [ "s3:*" ],
      resources: [
        `arn:aws:s3:::${ name }`,
        `arn:aws:s3:::${ name }/*`,
      ],
      principals: [ new iam.AnyPrincipal() ],
      conditions: {
        Bool: { "aws:SecureTransport": "false" },  // Deny non-HTTPS requests
      },
    })

    this.bucket.addToResourcePolicy(bucketPolicy)
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
