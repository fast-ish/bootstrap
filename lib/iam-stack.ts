import * as cdk from "aws-cdk-lib"
import { Role } from "aws-cdk-lib/aws-iam"
import { Construct } from "constructs"
import { CdkAssetsRoleConstruct } from "./iam/assets"
import { CdkLookupRoleConstruct } from "./iam/lookup"
import { CdkImagesRoleConstruct } from "./iam/images"
import { CdkHandshakeRoleConstruct } from "./iam/handshake"
import { CdkDeployRoleConstruct } from "./iam/deploy"
import { CdkExecRoleConstruct } from "./iam/exec"
import { CdkDruidExecRoleConstruct } from "./iam/druid-exec"
import { CdkWebappExecRoleConstruct } from "./iam/webapp-exec"

// Nested stack containing all IAM roles required for Fastish platform operations
// Each role has specific permissions for different stages of deployment and execution
export class FastishRoles extends cdk.NestedStack {
  public handshake: Role      // Initial trust establishment with external accounts
  public lookup: Role          // Resource discovery and validation
  public assets: Role          // S3 asset upload and management
  public images: Role          // ECR container image management
  public deploy: Role          // CloudFormation stack deployment
  public exec: Role            // General execution permissions
  public druidExec: Role       // Druid-specific execution permissions
  public webappExec: Role      // Webapp-specific execution permissions

  constructor(scope: Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id + "-roles", props)

    // Role for establishing trust relationships with external accounts
    this.handshake = new CdkHandshakeRoleConstruct(scope, id).role
    // Role for discovering and validating AWS resources
    this.lookup = new CdkLookupRoleConstruct(scope, id).role
    // Role for uploading and managing assets in S3
    this.assets = new CdkAssetsRoleConstruct(scope, id).role
    // Role for managing container images in ECR
    this.images = new CdkImagesRoleConstruct(scope, id).role
    // Role for deploying CloudFormation stacks
    this.deploy = new CdkDeployRoleConstruct(scope, id).role
    // General execution role for CloudFormation operations
    this.exec = new CdkExecRoleConstruct(scope, id).role
    // Druid-specific execution role with extended permissions
    this.druidExec = new CdkDruidExecRoleConstruct(scope, id).role
    // Webapp-specific execution role with webapp permissions
    this.webappExec = new CdkWebappExecRoleConstruct(scope, id).role
  }
}
