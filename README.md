# bootstrap

<div align="center">

*minimal fastish bootstrap cdk application that creates a handshake role for cross-account access to aws cdk default resources*

[![license: mit](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![typescript](https://img.shields.io/badge/TypeScript-5%2B-blue.svg)](https://www.typescriptlang.org/)
[![aws cdk](https://img.shields.io/badge/AWS%20CDK-latest-orange.svg)](https://aws.amazon.com/cdk/)

</div>

## overview

the bootstrap stack creates a minimal set of resources required for fastish to securely access your aws account. it leverages the standard aws cdk bootstrap resources (created by `cdk bootstrap`) and only adds a handshake role for cross-account access.

### what this creates

the bootstrap stack provisions **only one resource**:

#### handshake iam role
+ **purpose**: establishes secure cross-account trust with the fastish host account
+ **trust policy**: allows the fastish host account to assume this role using external id verification
+ **permissions**: can assume aws cdk default bootstrap roles in your account:
  - `cdk-hnb659fds-cfn-exec-role-{account}-{region}` - cloudformation execution
  - `cdk-hnb659fds-deploy-role-{account}-{region}` - deployment operations
  - `cdk-hnb659fds-file-publishing-role-{account}-{region}` - s3 asset publishing
  - `cdk-hnb659fds-image-publishing-role-{account}-{region}` - ecr image publishing
  - `cdk-hnb659fds-lookup-role-{account}-{region}` - resource discovery
+ **additional permissions**:
  - access to cdk s3 assets bucket and ecr repository
  - describe availability zones
  - simulate principal policies (for verification)
  - read secrets manager secrets with fastish prefix
  - get route53 hosted zone information
  - get service quotas

### architecture

```
┌─────────────────────────────────────────────────────┐
│ Your AWS Account                                     │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ AWS CDK Bootstrap (you create first)          │  │
│  │  • cdk-hnb659fds-cfn-exec-role-*              │  │
│  │  • cdk-hnb659fds-deploy-role-*                │  │
│  │  • cdk-hnb659fds-file-publishing-role-*       │  │
│  │  • cdk-hnb659fds-image-publishing-role-*      │  │
│  │  • cdk-hnb659fds-lookup-role-*                │  │
│  │  • cdk-hnb659fds-assets-* (S3 bucket)         │  │
│  │  • cdk-hnb659fds-container-assets-* (ECR)     │  │
│  └──────────────────────────────────────────────┘  │
│                          ▲                          │
│                          │ assumes                  │
│  ┌──────────────────────┼──────────────────────┐   │
│  │ Fastish Bootstrap (this repo)              │   │
│  │  • fastish-{name}-handshake                │   │
│  │    (cross-account trust role)              │   │
│  └────────────────────────────────────────────┘   │
│                          ▲                          │
└──────────────────────────┼──────────────────────────┘
                           │ assumes from
┌──────────────────────────┼──────────────────────────┐
│ Fastish Host Account     │                          │
│  • subscriber role ──────┘                          │
│    (with external id verification)                  │
└─────────────────────────────────────────────────────┘
```

## getting started

### prerequisites

+ [node.js 18+](https://nodejs.org/)
+ [npm](https://www.npmjs.com/)
+ [aws cli configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)
+ [aws cdk cli](https://docs.aws.amazon.com/cdk/v2/guide/getting-started.html): `npm install -g aws-cdk`
+ aws account with administrator access

### critical prerequisite: aws cdk bootstrap (default resources)

**you must run the standard aws cdk bootstrap command first**. this creates the foundational cdk toolkit resources that fastish will use. the fastish bootstrap only creates a handshake role that provides secure access to these existing cdk resources.

```bash
cdk bootstrap aws://<account-id>/<region>
```

**what the default cdk bootstrap creates**:
+ **s3 bucket**: `cdk-hnb659fds-assets-<account-id>-<region>` for staging cdk assets
+ **ecr repository**: `cdk-hnb659fds-container-assets-<account-id>-<region>` for container images
+ **5 iam roles**:
  - `cdk-hnb659fds-cfn-exec-role-<account-id>-<region>` - cloudformation execution
  - `cdk-hnb659fds-deploy-role-<account-id>-<region>` - deployment orchestration
  - `cdk-hnb659fds-file-publishing-role-<account-id>-<region>` - s3 asset uploads
  - `cdk-hnb659fds-image-publishing-role-<account-id>-<region>` - ecr image uploads
  - `cdk-hnb659fds-lookup-role-<account-id>-<region>` - resource discovery
+ **ssm parameter**: `/cdk-bootstrap/hnb659fds/version` for tracking bootstrap version

**example**:
```bash
# for account 123456789012 in us-west-2
cdk bootstrap aws://123456789012/us-west-2

# output will show:
# ✅ Environment aws://123456789012/us-west-2 bootstrapped
```

**important**: this is a one-time operation per account/region combination. for more details:
+ [aws cdk bootstrapping guide](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html)
+ [cdk bootstrap command reference](https://docs.aws.amazon.com/cdk/v2/guide/ref-cli-cmd-bootstrap.html)

### deployment

#### step 1: install dependencies

```bash
npm install
```

#### step 2: build the project

```bash
npm run build
```

#### step 3: configure deployment

the `cdk.json` file tells the cdk toolkit how to execute the app. customize `cdk.context.json` to configure the cross-account trust:

**example `cdk.context.json`**:
```json
{
  "host": {
    "account": "111111111111"
  },
  "synthesizer": {
    "name": "prod",
    "account": "123456789012",
    "region": "us-west-2",
    "externalId": "your-unique-external-id-from-fastish",
    "subscriberRoleArn": "arn:aws:iam::111111111111:role/fastish/subscriber/xxx",
    "cdk": {
      "version": "21"
    }
  }
}
```

**field descriptions**:
+ `host.account` - the fastish host aws account id (provided by fastish)
+ `synthesizer.name` - unique name for this handshake (e.g., "prod", "staging")
+ `synthesizer.account` - your aws account id
+ `synthesizer.region` - aws region where cdk bootstrap was run
+ `synthesizer.externalId` - secure external id for cross-account trust (provided by fastish)
+ `synthesizer.subscriberRoleArn` - the fastish subscriber role arn (provided by fastish)
+ `synthesizer.cdk.version` - cdk version number (for tracking)

the stack will be deployed as `fastish-prod` (using the name field).

#### step 4: preview changes

```bash
npx cdk synth
```

this generates the cloudformation template without deploying.

#### step 5: deploy bootstrap stack

```bash
npx cdk deploy
```

**what gets deployed**:
+ 1 cloudformation stack: `fastish-<synthesizer-name>`
+ 1 iam role: `fastish-<synthesizer-name>-handshake`
  - can assume cdk default roles in your account
  - trusted by fastish host account with external id verification

#### step 6: capture outputs

after deployment, the stack outputs a json object containing the handshake role and references to cdk default resources:

```json
{
  "roles": {
    "handshake": "arn:aws:iam::123456789012:role/fastish-prod-handshake"
  },
  "cdk": {
    "roles": {
      "cfnExec": "arn:aws:iam::123456789012:role/cdk-hnb659fds-cfn-exec-role-123456789012-us-west-2",
      "deploy": "arn:aws:iam::123456789012:role/cdk-hnb659fds-deploy-role-123456789012-us-west-2",
      "filePublishing": "arn:aws:iam::123456789012:role/cdk-hnb659fds-file-publishing-role-123456789012-us-west-2",
      "imagePublishing": "arn:aws:iam::123456789012:role/cdk-hnb659fds-image-publishing-role-123456789012-us-west-2",
      "lookup": "arn:aws:iam::123456789012:role/cdk-hnb659fds-lookup-role-123456789012-us-west-2"
    },
    "storage": {
      "assets": "arn:aws:s3:::cdk-hnb659fds-assets-123456789012-us-west-2",
      "containerAssets": "arn:aws:ecr:us-west-2:123456789012:repository/cdk-hnb659fds-container-assets-123456789012-us-west-2"
    }
  }
}
```

**save the handshake role arn** - you'll need to provide this to the fastish platform when creating your synthesizer configuration.

## testing

the project includes comprehensive unit tests using jest and aws cdk assertions. tests verify the infrastructure code creates the expected aws resources with correct configurations.

### running tests

```bash
npm test
```

this runs all tests once and displays results.

### running tests with coverage

```bash
npm test -- --coverage
```

coverage reports show which parts of the code are tested. reports are generated in the `coverage/` directory.

### running tests in watch mode

```bash
npm test -- --watch
```

watch mode automatically re-runs tests when files change, useful during development.

### what the tests cover

the test suite validates:

+ cloudformation template snapshot validation
+ handshake iam role with trust policy for cross-account access
+ iam policy allowing handshake role to assume cdk default roles
+ cloudformation outputs include references to cdk bootstrap resources

### test structure

tests use the `aws-cdk-lib/assertions` library:
+ `Template.fromStack()` - generates cloudformation from cdk stacks
+ `Match.objectLike()` - validates resource properties
+ `Match.arrayWith()` - checks array contents
+ `toMatchSnapshot()` - detects unexpected template changes

**example test**:
```typescript
test('creates handshake role with correct trust policy', () => {
  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: Match.objectLike({
      Statement: Match.arrayWith([
        Match.objectLike({
          Effect: 'Allow',
          Principal: { AWS: 'arn:aws:iam::111111111111:root' },
          Condition: {
            StringEquals: { 'sts:ExternalId': 'test-external-id' }
          }
        })
      ])
    })
  });
});
```

## useful commands

| command           | description                                          |
|-------------------|------------------------------------------------------|
| `npm run build`   | compile typescript to javascript                     |
| `npm run watch`   | watch for file changes and auto-compile              |
| `npm run test`    | run jest unit tests                                  |
| `npx cdk synth`   | generate cloudformation template (preview)           |
| `npx cdk diff`    | compare deployed stack with current code             |
| `npx cdk deploy`  | deploy stack to aws account/region                   |
| `npx cdk destroy` | destroy stack (requires s3 bucket to be empty first) |

## cleanup

to remove the bootstrap stack:

```bash
npx cdk destroy
```

this will delete only the handshake role. the aws cdk default bootstrap resources (s3, ecr, roles) will remain intact and can continue to be used by other cdk applications.

**note**: if you want to completely remove all cdk resources, you would need to manually delete the cdk bootstrap stack (CDKToolkit) from cloudformation console, but this is typically not recommended if you use cdk for other applications.

## configure grafana

### prerequisite

 + manually create an access policy and token to enable creating access policies and tokens
    - https://grafana.com/orgs/changeme/access-policies
    - allow
      - accesspolicies:read
      - accesspolicies:write
      - accesspolicies:delete
 + update `inputs.json` configuration fields described below 
 + execute script
    ```shell
    cd scripts/grafana
    ./create.sh inputs.json
    ```
 + what happens?
   + creates required access policy for aws eks to communicate with grafana cloud
   + creates aws secret in a structure that eks/druid expects when installing the grafana k8s-monitoring helm chart

### Configuration Fields

#### `cloud_access_policy_token`
- **Description**: A token used for authenticating access to the Grafana cloud services. This token typically has permissions to access specific Grafana resources and services.
- **Example**: `"glc_eyJ..."` (This token should be provided by Grafana Cloud to enable authenticated access.)

#### `prometheus_host`
- **Description**: The URL of your Prometheus instance in the Grafana Cloud.
- **Example**: `"https://prometheus-prod-1-prod-us-west-0.grafana.net"`
- **Usage**: Used to access the Prometheus service, typically for querying metrics.

#### `prometheus_username`
- **Description**: The username associated with your Prometheus instance. This is often tied to your Grafana account and is used to authenticate API requests to Prometheus.
- **Example**: `"0000000"`
- **Usage**: Required for API access to Prometheus endpoints.

#### `loki_host`
- **Description**: The URL of your Loki instance in the Grafana Cloud.
- **Example**: `"https://logs-prod-1.grafana.net"`
- **Usage**: This is the base URL for accessing Loki logs.

#### `loki_username`
- **Description**: The username associated with your Loki instance.
- **Example**: `"000000"`
- **Usage**: Used to authenticate API requests to Loki.

#### `tempo_host`
- **Description**: The URL for accessing your Tempo instance (for tracing data) on Grafana Cloud.
- **Example**: `"https://tempo-prod-1-prod-us-west-0.grafana.net:443"`
- **Usage**: Used to send or query trace data from your Tempo instance.

#### `tempo_username`
- **Description**: The username associated with your Tempo instance.
- **Example**: `"000000"`
- **Usage**: Used for authenticating access to Tempo's trace data API.

#### `alias`
- **Description**: An arbitrary name that can be assigned to this access policy. It can be any identifier you choose, and it will be mapped to an IAM policy statement for access control.
- **Example**: `"changeme"`
- **Usage**: This alias helps identify the access policy within your organization and map it to relevant IAM roles or access controls.

#### `instance_id`
- **Description**: The unique identifier for your Grafana Cloud stack instance. This value is essential for API calls to the Grafana service to fetch or manage resources specific to your organization.
- **Example**: `"000000"`
- **Usage**: You can retrieve your organization ID from the URL when you are logged into Grafana Cloud: `https://grafana.com/api/orgs/{your-organization}/instances`.

#### `region`
- **Description**: The region in which your Grafana Cloud services are located. This field helps define which region-specific access policies or configurations apply to your cloud access.
- **Example**: `"prod-us-west-0"`
- **Usage**: Used for applying access policies regionally (e.g., in IAM permissions or when defining which services to connect to based on region).

---

### Example Configuration

Here is an example of how this configuration file might look:

```json
{
  "cloud_access_policy_token": "glc_eyJ",
  "prometheus_host": "https://prometheus-prod-1-prod-us-west-0.grafana.net",
  "prometheus_username": "0000000",
  "loki_host": "https://logs-prod-1.grafana.net",
  "loki_username": "000000",
  "tempo_host": "https://tempo-prod-1-prod-us-west-0.grafana.net:443",
  "tempo_username": "000000",
  "alias": "changeme",
  "instance_id": "000000",
  "region": "prod-us-west-0"
}
```

---

## How to Use

1. **Set up Grafana Cloud**: You will need an active Grafana Cloud account and the required services (Prometheus, Loki, Tempo) enabled.
2. **Obtain your API Tokens**: You can generate an API token for authenticating with the Grafana Cloud API from the Grafana Cloud dashboard.
3. **Find your `instance_id`**: You can find your Grafana Cloud instance ID by visiting the API URL: `https://grafana.com/api/orgs/<your-organization>`. The instance ID will be available in the response.
4. **Define your IAM Policy**: The `alias` field maps to an IAM policy statement. Ensure your IAM policies are properly configured to allow the necessary access to Prometheus, Loki, and Tempo services based on the alias.
5. **Set the Region**: Make sure the `region` field corresponds to the region where your Grafana Cloud services are hosted. The region might influence access policies or how you manage your services.

---

## Further Customization

- **Access Policies**: Based on the `alias`, you may create specific IAM roles or permission statements that restrict or allow access to Grafana services (e.g., Prometheus, Loki, Tempo).
- **Service-Specific Configuration**: You may need additional configuration per service, such as Prometheus alerting settings or Loki log retention policies. These can be set in the relevant Grafana dashboards or API endpoints once connected.

---

## Troubleshooting

- **Invalid Token**: Ensure that the `cloud_access_policy_token` is valid and has the required scope to access Grafana Cloud services.
- **Connection Issues**: Verify the URLs in the `prometheus_host`, `loki_host`, and `tempo_host` fields to ensure they are correct and reachable.
- **IAM Policy**: If you experience access issues, verify that the IAM policies associated with the `alias` allow the appropriate permissions for the services you are attempting to access.
