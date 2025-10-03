import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import { RemovalPolicy } from "aws-cdk-lib"
import { FastishRoles } from "./iam-stack"
import { FastishStorage } from "./storage-stack"
import { FastishKeys } from "./keys-stack"

// Main bootstrap stack for Fastish infrastructure-as-a-service platform
// Creates and manages IAM roles, storage resources, and encryption keys
export class BootstrapStack extends cdk.Stack {
  public roles: FastishRoles
  public storage: FastishStorage
  public keys: FastishKeys

  constructor(scope: Construct, id: string, name: string, props?: cdk.StackProps) {
    super(scope, id + `-${ name }`, props)

    // IAM roles for different deployment and execution phases
    // These roles provide granular permissions for each stage of the deployment process
    this.roles = new FastishRoles(this, "fastish", {
      description: "cdk roles required for fastish releases",
      removalPolicy: RemovalPolicy.DESTROY
    })

    // Storage resources including S3 for assets and ECR for container images
    // This provides the foundation for storing deployment artifacts and Docker images
    this.storage = new FastishStorage(this, "fastish", {
      description: "cdk storage required for fastish releases",
      removalPolicy: RemovalPolicy.DESTROY
    })

    // KMS encryption keys and SSM parameters for secure credential storage
    // Enables encryption at rest and secure parameter management
    this.keys = new FastishKeys(this, "fastish", {
      description: "cdk keys required for fastish releases",
      removalPolicy: RemovalPolicy.DESTROY
    })

    // Ensures ECR repository is created after IAM roles to avoid permission issues
    this.storage.ecr.node.addDependency(this.roles)

    // Aggregates all resource ARNs for output
    // Provides complete reference to all created resources
    const required = {
      roles: {
        handshake: this.roles.handshake.roleArn,      // Initial trust establishment role
        lookup: this.roles.lookup.roleArn,            // Resource discovery and lookup role
        assets: this.roles.assets.roleArn,            // S3 asset management role
        images: this.roles.images.roleArn,            // ECR image management role
        deploy: this.roles.deploy.roleArn,            // Main deployment execution role
        exec: this.roles.exec?.roleArn,               // Optional execution role for runtime operations
        druidExec: this.roles.druidExec?.roleArn,     // Optional Druid execution role
        webappExec: this.roles.webappExec?.roleArn,   // Optional webapp execution role
        eksExec: this.roles.eksExec?.roleArn,         // Optional EKS execution role
      },
      storage: {
        assets: this.storage.s3.bucket.bucketArn,           // S3 bucket for deployment assets
        images: this.storage.ecr.repository.repositoryArn,  // ECR repository for container images
      },
      keys: {
        kms: {
          key: this.keys.kms.key.keyArn,        // KMS key ARN for encryption
          alias: this.keys.kms.alias.aliasName  // KMS alias for easy reference
        },
        ssm: {
          parameter: this.keys.ssm.parameter.parameterArn  // SSM parameter for secure storage
        }
      }
    }

    // Outputs all resource ARNs as JSON for consumption by other stacks or applications
    new cdk.CfnOutput(this, "fastish-resources", {
      key: "fastish",
      value: JSON.stringify(required),
    })
  }
}
