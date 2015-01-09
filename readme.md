# Vizify Tool [![Build Status](http://api.screwdriver.corp.yahoo.com:4080/badge/27334/component/icon)](http://api.screwdriver.corp.yahoo.com:4080/badge/27334/component/target)

A command-line utility for working with Vizify cards.

## Installation

```bash
ynpm install -g vizify-tool
# Or
ynpm install -g git+ssh://git@git.corp.yahoo.com:vizify/tool.git
```

## Usage

This describes command line usage, but this works as a library as well (docs for that TODO).

```bash
vz devel [--dir=<working dir>] # Starts a development server for a card
vz publish [--dir=<working dir>] # Compiles and publishes an HTML5 card to S3/Mobstor
vz init # Scaffolds out a card in the current directory
```

## Developing

#### Updating `vizify-virgil`

We use a subtree for updating `vizify-virgil`.  Use this command to update:

```bash
git subtree pull --prefix src/vizify git@git.corp.yahoo.com:lpstein/vizify-virgil.git master --squash
```

## Card Format

This tool expects the following structure for any card:

```
root-folder/
  card.json - Card spec
  src/
    main.vgl - Entry point, must export: function main(json : str)
```

#### `card.json`

Check out https://git.corp.yahoo.com/vizify/great-white-virgil/tree/master/card.json
for an example of how to set up your card json.

#### Screwdriver

If you want to hook your card up to Screwdriver, you can use this
V3 `screwdriver.yaml` to have to auto publish on commit:

```yaml
platform: nodejs_lib
shared:
  notifications:
    email: cards-dev@yahoo-inc.com

  plugins:
    coverage:
      enabled: false
    test_results:
      enabled: false

  steps:
    init:
      description: "Install vizify-tool"
      command: "npm install vizify-tool"
    publish:
      description: "Publish to Mobstor"
      command: "yinst restart yca_client_certs; ./node_modules/.bin/vz publish"

jobs:
  pull-request:
    profile: [init]
  component:
    profile: [init, publish]
```
