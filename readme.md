# Vizify Tool

A command-line utility for working with Vizify cards.

## Installation

```bash
ynpm install -g vizify-tool
# Or
ynpm install -g git+ssh://git@git.corp.yahoo.com:vizify/tool.git
```

## Usage

Note: nothing implemented yet, this is all theoretical

```bash
vz build cpp git@git.corp.yahoo.com:vizify/card-demo.git output-cpp/
vz build js git@git.corp.yahoo.com:vizify/card-demo.git output-js/
vz build cpp ~/some-card output-cpp/
vz watch js ~/some-card output-js
vz update output-cpp
vz update output-js
```

## Developing

#### Updating `vizify-virgil`

We use a subtree for updating `vizify-virgil`.  Use this command to update:

```bash
git subtree pull --prefix src/vizify git@git.corp.yahoo.com:lpstein/vizify-virgil.git master --squash
```
