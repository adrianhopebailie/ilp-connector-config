# ilp-connector-config

A skeleton config for an ILP connector.

The content of `./etc/ilp-connector` can be copied to `/etc/ilp-connector` on the connector server then modified as required.

The content of `./home` can be copied to the homedir of the user that will run ILP connector.

If the `./home/bin` folder is on the users path then the scripts can be used to manage the config

## ilp-connector

Supports 4 commands, `test`, `restart`, `enable` and `disable`

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

More details on this project are available in the accompanying blog post: https://medium.com/interledger-blog/connector-operations-a1aa4cc6137a