# ilp-connector-config

A skeleton config for an ILP connector and some tools for mamnaging the config.

## Installation

```sh
$ npm install -g ilp-connector-config
```

The content of `./etc/ilp-connector` can be copied to `/etc/ilp-connector` on the connector server then modified as required.
The content of `./home` can be copied to the homedir of the user that will run ILP connector.

This can be automated by calling `ilp-connector-config create`.


## ilp-connector

Supports 6 commands, `create`, `test`, `restart`, `enable`, `disable` and `clean-channels`

The following will copy the config skeleton into `/etc/ilp-connector`:
```
$ ilp-connector create
```
The following will enable the peer **peer1**:
```
$ ilp-connector enable peer1
```
The following will disable it:
```
$ ilp-connector disable peer1
```
The connector must still be restarted after changes. This can be done with:
```
$ ilp-connector restart
```
The config can also be tested first with:
```
$ ilp-connector test
```
The following will connect to the XRP ledger and look for all out going payment channels for this connector.
For each of these it will look for incoming payment channels from the same account.
If no incoming channels exist it will close the outgoing channels.

The first run will request that the channels are closed (which starts the expiry timer), the second run will finally close channels that have expired:
```
$ ilp-connector clean-channels
```

**WARNING: This command asks no questions, it will close the outgoing channels it needs to without prompts.**

More details on this project are available in the accompanying blog post: https://medium.com/interledger-blog/connector-operations-a1aa4cc6137a