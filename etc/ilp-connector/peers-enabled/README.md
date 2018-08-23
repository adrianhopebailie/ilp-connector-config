## Enabled peers

Symlink files from `../peers-available` to enable them. Use the installed scripts or do so manually

```sh
$ ilp-connector-config enable mini
```
Is equivalent to the following (with some extra checks):
```sh
$ ln -sr /etc/ilp-connector/sites-available/mini.conf.js /etc/ilp-connector/sites-enabled/mini.conf.js
```

```sh
$ ilp-connector-config disable mini
```
Is equivalent to the following (with some extra checks):
```sh
$ rm /etc/ilp-connector/sites-enabled/mini.conf.js
```