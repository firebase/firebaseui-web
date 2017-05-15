#!/bin/bash
# Copyright 2016 Google Inc. All Rights Reserved.
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

#
# Creates a CSS sprite of world flags.
# Usage (outputting to directory ./out):
# $ ./generate_country_data.sh ./out
#

if [[ $# -eq 0 ]] ; then
    echo "Usage: $0 /path/to/output/directory"
    exit 1
fi

# Retrieve flag source images from Github.
TMP_DIR=$(mktemp -d)
FLAGS_DIR="$TMP_DIR/region-flags"
git clone https://github.com/googlei18n/region-flags.git "$FLAGS_DIR"

# Convert SVGs to PNGs of the desired size.
RENDERED_PNG_DIR="$TMP_DIR/png"
mkdir "$RENDERED_PNG_DIR"
./make_flag_pngs.js "$FLAGS_DIR/svg" "$RENDERED_PNG_DIR"
ls "$RENDERED_PNG_DIR"

# Make the PNGs into a CSS sprite.
SPRITE_DIR="$TMP_DIR/sprite"
mkdir "$SPRITE_DIR"
./make_flag_sprite.js "$RENDERED_PNG_DIR" "$SPRITE_DIR"

# Compress the images and write to the output directory.
OUT_DIR="$1"
mkdir -p "$OUT_DIR"
cp "$SPRITE_DIR/flags.css" "$OUT_DIR"
./compress_pngs.js "$SPRITE_DIR" "$OUT_DIR"

# Generate the country data JS.
./filter_country_data.js > "$OUT_DIR/country_data.js"
