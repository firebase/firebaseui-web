#!/bin/bash
# Copyright 2019 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Publishes a new version of the firebaseui NPM package. The release notes is
# generated from CHANGELOG.md. You need to login to npm using
# `npm login --registry https://wombat-dressing-room.appspot.com` before running
# this script. The twitter and hub credentials have to be set up.
#
# Usage:
# $ buildtools/publish.sh <major|minor|patch>

# CD to the root FirebaseUI directory, which should be the parent directory of
# buildtools/.
set -e

printusage() {
  echo "publish.sh <version>"
  echo "REPOSITORY_ORG and REPOSITORY_NAME should be set in the environment."
  echo "e.g. REPOSITORY_ORG=user, REPOSITORY_NAME=repo"
  echo ""
  echo "Arguments:"
  echo "  version: 'patch', 'minor', or 'major'."
}

VERSION=$1
if [[ $VERSION == "" ]]; then
  printusage
  exit 1
elif [[ ! ($VERSION == "patch" || \
           $VERSION == "minor" || \
           $VERSION == "major") ]]; then
  printusage
  exit 1
fi

if [[ $REPOSITORY_ORG == "" ]]; then
  printusage
  exit 1
fi
if [[ $REPOSITORY_NAME == "" ]]; then
  printusage
  exit 1
fi

WDIR=$(pwd)

echo "Checking for commands..."
trap "echo 'Missing hub.'; exit 1" ERR
which hub &> /dev/null
trap - ERR

trap "echo 'Missing node.'; exit 1" ERR
which node &> /dev/null
trap - ERR

trap "echo 'Missing jq.'; exit 1" ERR
which jq &> /dev/null
trap - ERR

trap "echo 'Missing JRE.'; exit 1" ERR
which java &> /dev/null
trap - ERR

trap "echo 'Missing python2.'; exit 1" ERR
which python &> /dev/null
trap - ERR

trap "echo 'Missing Chrome.'; exit 1" ERR
which google-chrome &> /dev/null
trap - ERR
echo "Chrome version:"
google-chrome --version
echo "Checked for commands."

echo "Checking for Twitter credentials..."
trap "echo 'Missing Twitter credentials.'; exit 1" ERR
test -f "${WDIR}/buildtools/twitter.json"
trap - ERR
echo "Checked for Twitter credentials..."

echo "Checking for logged-in npm user..."
trap "echo 'Please login to npm using \`npm login --registry https://wombat-dressing-room.appspot.com\`'; exit 1" ERR
npm whoami --registry https://wombat-dressing-room.appspot.com
trap - ERR
echo "Checked for logged-in npm user."

echo "Moving to temporary directory..."
TEMPDIR=$(mktemp -d)
echo "[DEBUG] ${TEMPDIR}"
cd "${TEMPDIR}"
echo "Moved to temporary directory."

echo "Cloning repository..."
git clone "git@github.com:${REPOSITORY_ORG}/${REPOSITORY_NAME}.git"
cd "${REPOSITORY_NAME}"
echo "Cloned repository."

echo "Making sure there is a changelog..."
if [ ! -s CHANGELOG.md ]; then
  echo "CHANGELOG.md is empty. Aborting."
  exit 1
fi
echo "Made sure there is a changelog."

echo "Running npm ci..."
npm ci
echo "Ran npm ci."

CURRENT_VERSION=$(jq -r ".version" package.json)
echo "Making a $VERSION version..."
npm version $VERSION
NEW_VERSION=$(jq -r ".version" package.json)
echo "Made a $VERSION version."

echo "Making the release notes..."
RELEASE_NOTES_FILE=$(mktemp)
echo "[DEBUG] ${RELEASE_NOTES_FILE}"
echo "v${NEW_VERSION}" >> "${RELEASE_NOTES_FILE}"
echo "" >> "${RELEASE_NOTES_FILE}"
cat CHANGELOG.md >> "${RELEASE_NOTES_FILE}"
echo "Made the release notes."

echo "Publishing to npm..."
npm publish
echo "Published to npm."

echo "Bumping version numbers in README..."
sed -i "s/firebasejs\/ui\/${CURRENT_VERSION}/firebasejs\/ui\/${NEW_VERSION}/g" README.md
git add README.md
echo "Bumped version numbers in README."

echo "Cleaning up release notes..."
rm CHANGELOG.md
touch CHANGELOG.md
git add CHANGELOG.md
git commit -m "[firebase-release] Removed change log and reset repo after ${NEW_VERSION} release"
echo "Cleaned up release notes."

echo "Pushing to GitHub..."
git push origin master --tags
echo "Pushed to GitHub."

echo "Publishing release notes..."
hub release create --file "${RELEASE_NOTES_FILE}" "v${NEW_VERSION}"
echo "Published release notes."

echo "Making the tweet..."
npm install --no-save twitter@1.7.1
cp -v "${WDIR}/buildtools/twitter.json" "${TEMPDIR}/${REPOSITORY_NAME}/buildtools/"
node ./buildtools/tweet.js ${NEW_VERSION}
echo "Made the tweet."
