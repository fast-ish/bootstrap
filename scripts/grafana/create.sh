#!/bin/bash

source ./create-integration.sh

red=$(tput setaf 1)
green=$(tput setaf 2)
yellow=$(tput setaf 3)
nc=$(tput sgr0)

log_info() {
    echo "${green}[info]${nc} $1"
}

log_error() {
    echo "${red}[error]${nc} $1" >&2
}

log_warn() {
    echo "${yellow}[warn]${nc} $1"
}

if [ "$#" -ne 1 ]; then
    log_error "usage: $0 <template>.json"
    exit 1
fi

input_json="$1"

if [ ! -f "$input_json" ]; then
    log_error "input file not found: $input_json"
    exit 1
fi

cloud_access_policy_token=$(jq -r '.cloud_access_policy_token' < "$input_json")
loki_host=$(jq -r '.loki_host' < "$input_json")
loki_username=$(jq -r '.loki_username' < "$input_json")
prometheus_host=$(jq -r '.prometheus_host' < "$input_json")
prometheus_username=$(jq -r '.prometheus_username' < "$input_json")
tempo_host=$(jq -r '.tempo_host' < "$input_json")
tempo_username=$(jq -r '.tempo_username' < "$input_json")
alias=$(jq -r '.alias' < "$input_json")
instance_id=$(jq -r '.instance_id' < "$input_json")
region=$(jq -r '.region' < "$input_json")

if [[ -z "$cloud_access_policy_token" || -z "$loki_host" || -z "$loki_username" || -z "$prometheus_host" || -z "$prometheus_username" || -z "$tempo_host" || -z "$tempo_username" || -z "$alias" || -z "$instance_id" || -z "$region" ]]; then
    log_error "one or more required fields are missing in the input json"
    exit 1
fi

log_info "starting grafana integration..."
create_grafana_integration "$alias" "$instance_id" "$region" "$cloud_access_policy_token" "$loki_host" "$loki_username" "$prometheus_host" "$prometheus_username" "$tempo_host" "$tempo_username"
log_info "grafana integration completed successfully."
