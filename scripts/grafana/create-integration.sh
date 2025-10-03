#!/bin/bash

get_timestamp_90_days() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        date -u -v +90d +"%Y-%m-%d"
    else
        date -u -d "+90 days" +"%Y-%m-%d"
    fi
}

create_cloud_access_policy() {
    local grafana_api_token="$1"
    local alias="$2"
    local instance_id="$3"
    local region="$4"

    local expiration
    expiration=$(get_timestamp_90_days)

    local create_cloud_access_policy_request_body
    create_cloud_access_policy_request_body='{
      "name": "fastish-eks-'$(echo "$alias" | tr '[:upper:]' '[:lower:]')'",
      "displayName": "fastish-eks-monitoring ('$alias')",
      "scopes": [
        "metrics:read",
        "metrics:write",
        "logs:read",
        "logs:write",
        "traces:read",
        "traces:write",
        "profiles:read",
        "profiles:write",
        "alerts:read",
        "alerts:write",
        "rules:read",
        "rules:write"
      ],
      "realms": [{
        "type": "stack",
        "identifier": "'$instance_id'",
        "labelPolicies": []
      }]
    }'

    local cloud_access_policy_id
    cloud_access_policy_id=$(curl -s -X POST "https://www.grafana.com/api/v1/accesspolicies?region=$region" \
    -H "Authorization: Bearer ${grafana_api_token}" \
    -H "Content-Type: application/json" \
    -d "${create_cloud_access_policy_request_body}" | jq -r .id)

    sleep 5

    local expiration
    expiration=$(get_timestamp_90_days)

    local create_cloud_access_token_request_body
    create_cloud_access_token_request_body='{
      "accessPolicyId": "'$cloud_access_policy_id'",
      "name": "fastish-eks-'$(echo "$alias" | tr '[:upper:]' '[:lower:]')'-token",
      "displayName": "fastish-eks-monitoring-token ('$alias')",
      "expiresAt": "'$expiration'"
    }'

    local response
    response=$(curl -s -X POST "https://www.grafana.com/api/v1/tokens?region=$region" \
    -H "Authorization: Bearer ${grafana_api_token}" \
    -H "Content-Type: application/json" \
    -d "${create_cloud_access_token_request_body}" | jq -r .token)

    echo "$response"
}

create_json_payload() {
    local cloud_access_policy_token="$1"
    local loki_host="$2"
    local loki_username="$3"
    local prometheus_host="$4"
    local prometheus_username="$5"
    local tempo_host="$6"
    local tempo_username="$7"

    cat <<EOF
{
    "key": "$cloud_access_policy_token",
    "lokiHost": "$loki_host",
    "lokiUsername": "$loki_username",
    "prometheusHost": "$prometheus_host",
    "prometheusUsername": "$prometheus_username",
    "tempoHost": "$tempo_host",
    "tempoUsername": "$tempo_username"
}
EOF
}

create_secret() {
    local secret_name="$1"
    local secret_description="$2"
    local json_payload="$3"

    if ! echo "$json_payload" | jq . > /dev/null; then
        echo "invalid json payload. please check the inputs."
        return 1
    fi

    if ! aws secretsmanager create-secret --name "$secret_name" --description "$secret_description" --secret-string "$json_payload" --no-cli-pager; then
        echo "failed to create secret: $secret_name"
        return 1
    else
        echo "successfully created secret: $secret_name"
    fi
}

create_grafana_integration() {
    local alias="${1}"
    local instance_id="${2}"
    local region="${3}"
    local grafana_api_token="${4}"
    local loki_host="${5}"
    local loki_username="${6}"
    local prometheus_host="${7}"
    local prometheus_username="${8}"
    local tempo_host="${9}"
    local tempo_username="${10}"

    local secret_name="fastish-grafana-$alias"
    local secret_description="grafana secrets for eks integration"

    local cloud_access_policy_token
    cloud_access_policy_token=$(create_cloud_access_policy "$grafana_api_token" "$alias" "$instance_id" "$region")

    local json_payload
    json_payload=$(create_json_payload "$cloud_access_policy_token" "$loki_host" "$loki_username" "$prometheus_host" "$prometheus_username" "$tempo_host" "$tempo_username")

    create_secret "$secret_name" "$secret_description" "$json_payload" || exit 1

    echo "secret successfully created with access token"
}
