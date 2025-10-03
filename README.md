# bootstrap

fastish bootstrap resources and scripts

The `cdk.json` file tells the CDK Toolkit how to execute your app.
Customize `cdk.context.json` to scope access by create, update and delete.

## useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
* `npx cdk destroy` destroys this stack from your default AWS account/region (s3 needs to be emptied)

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
