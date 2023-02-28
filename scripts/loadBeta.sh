#!/bin/sh

set -e

NAME=unirep-beta-2-2
WORKDIR=$(mktemp)
TARFILE=$WORKDIR/${NAME}.tar.gz

wget https://pub-0a2a0097caa84eb18d3e5c165665bffb.r2.dev/${NAME}.tar.gz -P $WORKDIR  --progress=bar:force:noscroll

shasum -a 256 $TARFILE | grep 'd13ff9928a9c8f8bd5230261842811cb9ec1f25953d9d11685638a6b623ce90e'

rm -rf node_modules/@unirep
tar -xzf $TARFILE -C node_modules
mv node_modules/${NAME} node_modules/@unirep
