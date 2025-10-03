import { Construct } from "constructs"
import { ImagesRepo } from "./ecr/repo"
import { AssetsBucket } from "./s3/bucket"
import * as cdk from "aws-cdk-lib"

// Nested stack for storage resources used by Fastish platform
// Manages ECR repositories for container images and S3 buckets for deployment assets
export class FastishStorage extends cdk.NestedStack {
  public ecr: ImagesRepo   // ECR repository for Docker container images
  public s3: AssetsBucket   // S3 bucket for deployment artifacts and assets

  constructor(scope: Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id+ "-storage", props)

    // ECR repository for storing and managing Docker images
    this.ecr = new ImagesRepo(scope, id)
    // S3 bucket for storing deployment artifacts, templates, and other assets
    this.s3 = new AssetsBucket(scope, id)
  }
}
