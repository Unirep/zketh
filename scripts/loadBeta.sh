#!/bin/sh

set -e

NAME=unirep-beta-2-3
WORKDIR=$(mktemp)
TARFILE=$WORKDIR/${NAME}.tar.gz

wget https://pub-0a2a0097caa84eb18d3e5c165665bffb.r2.dev/${NAME}.tar.gz -P $WORKDIR  --progress=bar:force:noscroll

shasum -a 256 $TARFILE | grep 'b28b5ef95808b444e21d7ad6c9d2bf30cf501692cd7a37a6b51dc511231d2435'

rm -rf node_modules/@unirep
tar -xzf $TARFILE -C node_modules
mv node_modules/${NAME} node_modules/@unirep
