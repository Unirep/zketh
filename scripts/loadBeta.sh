#!/bin/sh

set -e

NAME=unirep-beta-2-1
WORKDIR=$(mktemp)
TARFILE=$WORKDIR/${NAME}.tar.gz

wget https://pub-0a2a0097caa84eb18d3e5c165665bffb.r2.dev/${NAME}.tar.gz -P $WORKDIR  --progress=bar:force:noscroll

shasum -a 256 $TARFILE | grep 'd5bf567bf4e8049d8ba84e7451470acdc082357df4e2892b07901dce191f44cf'

rm -rf node_modules/@unirep
tar -xzf $TARFILE -C node_modules
mv node_modules/${NAME} node_modules/@unirep
