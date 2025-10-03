# bootstrap

<div align="center">

*fastish bootstrap cdk application that provisions the foundational aws resources required for deploying fastish platform infrastructure and applications*

[![license: mit](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![typescript](https://img.shields.io/badge/TypeScript-5%2B-blue.svg)](https://www.typescriptlang.org/)
[![aws cdk](https://img.shields.io/badge/AWS%20CDK-latest-orange.svg)](https://aws.amazon.com/cdk/)

</div>

## overview

the bootstrap stack creates the foundational aws resources that the fastish platform requires for cdk deployments. this is a one-time setup that must be completed before deploying any fastish applications.

### what this creates

the bootstrap stack provisions three main resource categories:

#### 1. iam roles (8 specialized roles)
+ **handshake role**: establishes trust relationships with external aws accounts
+ **lookup role**: discovers and validates existing aws resources during deployment
+ **assets role**: manages s3 bucket operations for deployment assets (templates, files)
+ **images role**: manages ecr repository operations for docker container images
+ **deploy role**: executes cloudformation stack deployments and updates
+ **exec role**: general cloudformation execution permissions for custom resources
+ **druid exec role**: specialized execution role for apache druid deployments with extended permissions
+ **webapp exec role**: specialized execution role for web application deployments

#### 2. storage resources
+ **s3 bucket**: stores cdk deployment assets (cloudformation templates, lambda code, files)
  - versioning enabled
  - encryption at rest
  - lifecycle policies for cleanup
+ **ecr repository**: stores docker container images for lambda and fargate deployments
  - image scanning enabled
  - lifecycle policies for image retention

#### 3. encryption & parameters
+ **kms key**: encrypts sensitive data at rest (s3, secrets, parameters)
  - automatic key rotation
  - access controlled via iam policies
+ **kms alias**: friendly name for the encryption key (`alias/fastish`)
+ **ssm parameter**: stores fastish version and configuration metadata
  - encrypted with kms key
  - accessible to deployment roles

### architecture

```
BootstrapStack (fastish-<synthesizer-name>)
├── FastishRoles (nested stack)
│   ├── handshake role
│   ├── lookup role
│   ├── assets role
│   ├── images role
│   ├── deploy role
│   ├── exec role
│   ├── druid exec role
│   └── webapp exec role
├── FastishStorage (nested stack)
│   ├── s3 assets bucket
│   └── ecr images repository
└── FastishKeys (nested stack)
    ├── kms encryption key + alias
    └── ssm version parameter
```

## getting started

### prerequisites

+ [node.js 18+](https://nodejs.org/)
+ [npm](https://www.npmjs.com/)
+ [aws cli configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)
+ [aws cdk cli](https://docs.aws.amazon.com/cdk/v2/guide/getting-started.html): `npm install -g aws-cdk`
+ aws account with administrator access

### required: aws cdk bootstrap (default resources)

**before deploying the fastish bootstrap stack**, you must run the standard aws cdk bootstrap command. this creates the default cdk toolkit resources that aws cdk requires:

```bash
cdk bootstrap aws://<account-id>/<region>
```

**what the default cdk bootstrap creates**:
+ **s3 bucket**: `cdk-*-assets-<account-id>-<region>` for staging assets
+ **ecr repository**: `cdk-*-container-assets-<account-id>-<region>` for staging images
+ **iam roles**: `cdk-*` roles for cloudformation execution
+ **ssm parameter**: `/cdk-bootstrap/*/version` for tracking bootstrap version

**example**:
```bash
# for account 123456789012 in us-west-2
cdk bootstrap aws://123456789012/us-west-2
```

this is a one-time operation per account/region combination. for more details:
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

the `cdk.json` file tells the cdk toolkit how to execute the app. customize `cdk.context.json` to configure the synthesizer name and scope permissions:

**example `cdk.context.json`**:
```json
{
  "synthesizer": {
    "name": "prod"
  }
}
```

the synthesizer name will be used to create the stack as `fastish-prod`.

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
+ 1 main cloudformation stack: `fastish-<synthesizer-name>`
+ 3 nested cloudformation stacks: roles, storage, keys
+ 8 iam roles with specific permissions
+ 1 s3 bucket for assets
+ 1 ecr repository for container images
+ 1 kms key with alias for encryption
+ 1 ssm parameter for version tracking

#### step 6: capture outputs

after deployment, the stack outputs a json object containing all resource arns:

```json
{
  "roles": {
    "handshake": "arn:aws:iam::...",
    "lookup": "arn:aws:iam::...",
    "assets": "arn:aws:iam::...",
    "images": "arn:aws:iam::...",
    "deploy": "arn:aws:iam::...",
    "exec": "arn:aws:iam::...",
    "druidExec": "arn:aws:iam::...",
    "webappExec": "arn:aws:iam::..."
  },
  "storage": {
    "assets": "arn:aws:s3:::...",
    "images": "arn:aws:ecr:..."
  },
  "keys": {
    "kms": {
      "key": "arn:aws:kms:...",
      "alias": "alias/fastish"
    },
    "ssm": {
      "parameter": "arn:aws:ssm:..."
    }
  }
}
```

save these values - fastish platform deployments will reference these resources.

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

1. **empty the s3 bucket** (required before deletion):
   ```bash
   aws s3 rm s3://<bucket-name> --recursive
   ```

2. **delete ecr images** (optional, will be deleted with stack):
   ```bash
   aws ecr batch-delete-image \
     --repository-name <repo-name> \
     --image-ids imageTag=latest
   ```

3. **destroy the stack**:
   ```bash
   npx cdk destroy
   ```

**warning**: destroying this stack will prevent deployments of any fastish applications that depend on these resources.

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
