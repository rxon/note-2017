#!/usr/bin/env sh
set -e
date=`date '+%F'`
touch post/$1.md

cat <<EOF > post/$1.md
# $2

<time datetime="$date">$date</time>

> $3

$4
EOF
