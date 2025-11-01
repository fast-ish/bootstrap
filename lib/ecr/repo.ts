import { Construct } from "constructs"
import * as ecr from "aws-cdk-lib/aws-ecr"
import { Repository } from "aws-cdk-lib/aws-ecr"
import * as iam from "aws-cdk-lib/aws-iam"
import { RemovalPolicy } from "aws-cdk-lib"

// ECR repository construct for storing Docker container images
// Configures access permissions for different execution roles
export class ImagesRepo extends Construct {
  public repository: Repository

  constructor(scope: Construct, id: string) {
    super(scope, id)

    const t = this.target()
    const name = `${ id }-${ t.name.toLowerCase() }`

    // Create ECR repository for container images
    this.repository = new ecr.Repository(this, name, {
      repositoryName: name,
      removalPolicy: RemovalPolicy.DESTROY  // Allow deletion when stack is destroyed
    })

    // Configure principals based on enabled release types
    const principals = []
    if (t.releases.includes("all"))
      principals.push(new iam.ArnPrincipal(`arn:aws:iam::${ t.account }:role/${ id }-${ t.name }-exec`))
    if (t.releases.includes("druid"))
      principals.push(new iam.ArnPrincipal(`arn:aws:iam::${ t.account }:role/${ id }-${ t.name }-druid-exec`))
    if (t.releases.includes("webapp"))
      principals.push(new iam.ArnPrincipal(`arn:aws:iam::${ t.account }:role/${ id }-${ t.name }-webapp-exec`))

    // Grant read permissions to execution roles for pulling images
    this.repository.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "ecr:BatchCheckLayerAvailability",  // Check if layers exist
          "ecr:GetDownloadUrlForLayer",        // Get download URLs for layers
          "ecr:BatchGetImage",                 // Pull images
          "ecr:DescribeRepositories",          // Describe repository metadata
        ],
        principals: principals,
      }))
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
