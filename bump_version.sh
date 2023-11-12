#!/bin/bash
if [ $# -eq 1 ]; then
    git commit -am "Bumped version \`$1\`"
elif [ $# -eq 2 ]; then
    git commit -am "Bumped version \`$1\`\n$2"
else
    echo "Exactly 1 or 2 argument must be provided"
    exit false
fi
git commit -am "Bumped version \`$1\`"
git push
git tag "$1"
git push --tags
