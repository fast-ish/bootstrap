import { Construct } from "constructs"
import * as ssm from "aws-cdk-lib/aws-ssm"
import { StringParameter } from "aws-cdk-lib/aws-ssm"

// SSM Parameter construct for storing CDK version information
// Provides a centralized location for version tracking and configuration
export class CdkVersionParameter extends Construct {
  public parameter: StringParameter

  constructor(scope: Construct, id: string) {
    super(scope, id + "-cdk-version-parameter")

    const t = this.target()
    const name = `/cdk/${ id }-${ t.name }/version`

    // Create SSM parameter to store CDK version information
    // This allows other stacks and services to query the current version
    this.parameter = new ssm.StringParameter(this, "cdk-version-parameter", {
      parameterName: name,
      stringValue: t.version,
      description: `cdk managed version parameter for ${ t.name }`,
    })
  }

  private target() {
    const synthesizer = this.node.getContext("synthesizer")

    return {
      name: synthesizer.name,
      version: synthesizer.cdk.version,
    }
  }
}
