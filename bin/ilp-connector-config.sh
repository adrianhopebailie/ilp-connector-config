#!/bin/bash

_ilp_connector_config="/etc/ilp-connector/"

_command=$1
_account=$2     
_available_file="$_ilp_connector_config/peers-available/$_account.conf.js"
_enabled_file="$i_lp_connector_config/peers-enabled/$_account.conf.js"

_ecosystem_file="$HOME/ecosystem.config.js"
_script_source="${BASH_SOURCE[0]}"
while [ -h "$_script_source" ]; do
    _script_dir="$( cd -P "$( dirname "$_script_source" )" >/dev/null && pwd )"
    _script_source="$(readlink "$_script_source")"
    [[ $_script_source != /* ]] && _script_source="$_script_dir/$_script_source" 
done
_script_dir="$( cd -P "$( dirname "$_script_source" )" >/dev/null && pwd )"

_config_skel_dir()
{
    cd "$_script_dir/../etc/ilp-connector" 2>/dev/null || return $?
    echo "$(pwd -P)"
}

_ecosystem_file()
{
    cd "$_script_dir/../home" 2>/dev/null || return $?
    echo "$(pwd -P)/ecosystem.config.js"
}

_usage()
{
read -r -d '' _usage << EOM
Usage: ilp-connector <command> <account>

Commands:
    test - test the config
    restart - restart the connector and flush the logs
    enable <account> - enable an account/peer
    disable <account> - disable an account/peer
    create - copy the config skeleton into /etc/ilp-connector and the ecosystem.config.js file to $HOME if they don't not exist
    clean-channels - clean-up outgoing channels (WARN: This WILL close outgoing channels without further confirmations)
EOM

    echo "$_usage";
}

_file_exists ()
{
    if [ ! -f "$_available_file" ]; then
        echo "File $_available_file does not exist.";
        exit 1;
    fi    
}

if [ ! $_command ]; then
    _usage
    exit 1
else

    case "$_command" in
        enable)
            
            _file_exists;

            if [ -f "$_enabled_file" ]; then
              echo "Warning: Peer $_account is already enabled.";
    	    else
              ln -sr "$_available_file" "$_enabled_file"
              echo "peer $_account enabled";
            fi
        ;;

        disable)
            
            _file_exists

            if [ ! -f "$_enabled_file" ]; then
              echo "Warning: Peer $_account is already disabled.";
            else
              rm "$_enabled_file";
              echo "Peer $_account disabled";
            fi
            exit 0;
        ;;

        restart)

            if [ ! -f "$_ecosystem_file" ]; then
              echo "Error: $_ecosystem_file does not exist.";
              exit 1;
            else
              command -v pm2 >/dev/null 2>&1 || { echo >&2 "PM2 is not installed. Try npm install -g pm2."; exit 1; }
              pm2 restart $_ecosystem_file --update-env && pm2 flush;
            fi            
            exit 0;

        ;;

        test)

            if [ ! -f "$_ecosystem_file" ]; then
              echo "Error: $_ecosystem_file does not exist.";
              exit 1;
            else
              node $_ecosystem_file
            fi            
            exit 0;

        ;;

        create)

            if [ ! -d "$_ilp_connector_config" ] && [ ! -f "$_ecosystem_file" ]; then
              _config_skel="$(_config_skel_dir)"
              _ecosystem_file_template="$(_ecosystem_file)"
              echo "Copying $_config_skel to $_ilp_connector_config"
              cp -r $_config_skel $_ilp_connector_config
              echo "Copying $_ecosystem_file_template to $_ecosystem_file"
              cp $_ecosystem_file_template $_ecosystem_file
              echo "Manage config in $_ilp_connector_config and run with 'ilp-connector-config restart'"
            else
              echo "Error: $_ilp_connector_config or $_ecosystem_file already exists.";
              exit 1;
            fi            
            exit 0;

        ;;

        clean-channels)

            node $_script_dir/clean-channels.js

        ;;

        *)
            _usage;
            exit 0;       
        ;;
    esac

fi
