#!/bin/bash

green='\e[32m'
red='\e[31m'
nc='\e[0m'

log_success() {
    printf "%b%s%b\n" "$green" "$1" "$nc"
}

log_error() {
    printf "%berror: %s%b\n" "$red" "$1" "$nc"
}

if [ "$#" -lt 4 ]; then
    log_error "usage: $0 <api-token> <grafana-region> <policy-name> <secret-name>"
    exit 1
fi

api_token="$1"
grafana_region="$2"
policy_id="$3"
secret_name="$4"

delete_grafana_policy() {
    echo "deleting grafana cloud access policy: $policy_id"

    response=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
        "https://www.grafana.com/api/v1/accesspolicies/{$policy_id}?region=$grafana_region" \
        -H "Authorization: Bearer $api_token" \
        -H "Content-Type: application/json")

    if [ "$response" -ne 204 ]; then
        log_error "failed to delete grafana cloud access policy: $policy_id (HTTP status: $response)"
    else
        log_success "successfully deleted grafana cloud access policy: $policy_id"
    fi
}

delete_secret() {
    echo "deleting secret from aws secrets manager: $secret_name"
    if ! aws secretsmanager delete-secret --secret-id "$secret_name" --no-cli-pager --force-delete-without-recovery; then
        log_error "failed to delete secret: $secret_name"
    else
        log_success "successfully deleted secret: $secret_name"
    fi
}

delete_grafana_policy
delete_secret
