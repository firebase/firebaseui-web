#!/bin/bash
set -e

# This script is run by each package in the packages/ folder

# Configure npm authentication
# NPM_TOKEN is set in cloudbuild.yaml
echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" >.npmrc

# Decide the correct version and npm tag.
if [ -n "$TAG_NAME" ]; then
	echo "Git Tag detected: $TAG_NAME"
	NPM_TAG=beta
	# Delete the 'v' from the tag to get the version to publish
	OVERRIDE_VERSION=${TAG_NAME/v/}
else
	echo "No Git Tag detected (Commit trigger)"
	NPM_TAG=exp
	OVERRIDE_VERSION=$(node -e "console.log(require('./package.json').version)")-exp.$SHORT_SHA
fi

echo "Publishing version $OVERRIDE_VERSION with npm tag '$NPM_TAG' for commit $COMMIT_SHA."
npm --no-git-tag-version --allow-same-version version $OVERRIDE_VERSION

# pnpm publish is required here to prevent workspace stuff from being published with the package
pnpm publish --tag $NPM_TAG --access=public
