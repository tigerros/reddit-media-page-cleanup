# REQUIRED BINARIES:
# - jq (https://jqlang.github.io/jq/)
# - 7zip (https://7-zip.org/)
# - npx (https://nodejs.org/en/download)

set -x -e

src="src"
dist="dist"
firefox_dir="${src}/firefox"
firefox_dir_min="${src}/firefox.min"
chromium_dir="${src}/chromium"
chromium_dir_min="${src}/chromium.min"

# Overwrite previous dist directory.
rm -rf ./$dist
mkdir -p ./$dist

# Delete and create .min directories for Rollup.
rm -rf $firefox_dir_min
rm -rf $chromium_dir_min

# Remove Chromium _metadata
rm -rf $chromium_dir/_metadata

# Copy contents of source directories to minified directories.
cp -r $firefox_dir $firefox_dir_min
cp -r $chromium_dir $chromium_dir_min

# Minify JSON.
jq -c . < $firefox_dir/manifest.json > $firefox_dir_min/manifest.json
jq -c . < $chromium_dir/manifest.json > $chromium_dir_min/manifest.json
jq -c . < $chromium_dir/rules.json > $chromium_dir_min/rules.json

# Minify JS.
npx rollup --config

# Create minified .XPI package for release.
7z a -tzip $dist/reddit-media-page-cleanup-firefox.release.xpi ./$firefox_dir_min/*
# Create .XPI package with original source code for debugging.
7z a -tzip $dist/reddit-media-page-cleanup-firefox.debug.xpi ./$firefox_dir/*

# Create Chromium archives.
# This doesn't end in "/*" in order to copy the directory itself into the archive.
# The reason for that is because users have to load the unpacked directory in Chrome, not the archive.
7z a -tzip $dist/reddit-media-page-cleanup-chromium.release.zip ./$chromium_dir_min
# Create archive with original source code for debugging.
7z a -tzip $dist/reddit-media-page-cleanup-chromium.debug.zip ./$chromium_dir

# Delete .min directories.
rm -rf $firefox_dir_min
rm -rf $chromium_dir_min

# Chrome of course has stupid metadata so we can't use 7zip.
# THIS DOESN'T WORK RIGHT NOW. See <https://crbug.com/1498558>
# chrome --pack-extension ./$src/chromium

echo "Build finished"