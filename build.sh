set -x -e

src="src"
dist="dist"

# Overwrite previous dist directory.
rm -rf ./$dist
mkdir -p ./$dist

# Create Firefox add-on package (.XPI file) and source archive.
7z a -tzip $dist/reddit-media-page-cleanup-firefox.xpi ./$src/firefox/*
7z a -tzip $dist/reddit-media-page-cleanup-firefox-source.zip ./$src/firefox/*

# Create Chromium archive
7z a -tzip $dist/reddit-media-page-cleanup-chromium.zip ./$src/chromium

# Chrome of course has stupid metadata so we can't use 7zip.
# THIS DOESN'T WORK RIGHT NOW. See <https://crbug.com/1498558>
# chrome --pack-extension ./$src/chromium

echo "Build finished"