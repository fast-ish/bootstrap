import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { BootstrapStack } from '../lib/bootstrap-stack';

describe('BootstrapStack', () => {
  let app: cdk.App;
  let stack: BootstrapStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App({
      context: {
        host: {
          account: '111111111111'
        },
        self: {
          name: 'test',
          account: '123456789012',
          region: 'us-east-1',
          externalId: 'test-external-id',
          subscriberRoleArn: 'arn:aws:iam::111111111111:role/fastish/subscriber/test',
          cdk: {
            version: '21'
          }
        }
      }
    });
    stack = new BootstrapStack(app, 'TestBootstrapStack', 'test', {
      env: { account: '123456789012', region: 'us-east-1' }
    });
    template = Template.fromStack(stack);
  });

  describe('Snapshot Tests', () => {
    test('stack matches snapshot', () => {
      expect(template.toJSON()).toMatchSnapshot();
    });
  });

  describe('IAM Role Tests', () => {
    test('creates handshake IAM role with trust policy', () => {
      template.hasResourceProperties('AWS::IAM::Role', {
        AssumeRolePolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: 'Allow',
              Principal: Match.objectLike({
                AWS: Match.anyValue()
              }),
              Action: 'sts:AssumeRole'
            })
          ])
        })
      });
    });

    test('handshake role has policy to assume CDK roles', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: 'Allow',
              Action: 'sts:AssumeRole'
            })
          ])
        })
      });
    });
  });

  describe('CloudFormation Outputs', () => {
    test('output includes CDK role references', () => {
      const outputs = template.findOutputs('*');
      const outputValue = JSON.stringify(outputs);

      expect(outputValue).toContain('cdk-hnb659fds');
      expect(outputValue).toContain('cfn-exec-role');
      expect(outputValue).toContain('deploy-role');
    });
  });
});
