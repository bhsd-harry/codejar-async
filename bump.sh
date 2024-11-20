#!/usr/local/bin/bash
npm run lint && npm run build
if [[ $? -eq 0 ]]
then
	sed -i '' -E "s/\"version\": \".+\"/\"version\": \"$1\"/" package.json
	git add -A
	git commit -m "chore: bump version to $1"
	git push
fi
