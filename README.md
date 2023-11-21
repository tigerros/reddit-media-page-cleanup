# Reddit media page cleanup
## Features

- Shows only the image file on `i.redd.it`, `preview.redd.it`, `external-preview.redd.it` and `reddit.com/media?url=IMAGE_URL` pages.
This improves loading speed, removes trackers and fixes the broken zooming.
- Redirects `preview.redd.it` to the `i.redd.it` equivalent.
This gets you the highest quality image, and you can download a PNG/JPEG instead of the default `preview.redd.it` WEBP (which is not a traditional image file).
- Blocks an icon file request on the image file pages, since they don't have one.
The browser requests an icon for every page, but since they don't have one, blocking is a *tiny* bit faster.

## Comparison

Without extension:

<details>
<summary>Network log</summary>

![Without extension network log](without-extension-log.png)
</details>

<details>
<summary>Page screenshot</summary>

![Without extension page screenshot](without-extension-page.png)
</details>

There's 81 requests in total, most of which (50+) are JavaScript requests.
This is just unnecessary tracking and bloat.

---

With extension:

<details>
<summary>Network log</summary>

![With extension network log](with-extension-log.png)
</details>

<details>
<summary>Page screenshot</summary>

![With extension page screenshot](with-extension-page.png)
</details>

Only 2 requests this time, one of which is blocked (the non-existent favicon.ico).

## Installation

### Firefox

- [Add-on store](https://addons.mozilla.org/en-US/firefox/addon/reddit-media-page-cleanup/)

For manual installation, visit the [releases page].

### Chromium

*This applies to other Chromium browsers, such as Microsoft Edge, Opera or Brave.
This tutorial is for Chrome, but it should work for the others with some minor differences.
For example, instead of `chrome://extensions`, you use `edge://extensions` on Edge.*

1. Download `reddit-media-page-cleanup-chromium.zip` from the [latest release].
2. Extract it. **Don't delete it, it will be uninstalled if you do.**
3. Go to `chrome://extensions`.
4. Turn on "Developer mode" in the top-right corner.
5. Click "Load unpacked" in the top-left corner.
6. Select the extracted folder.

The Chrome Web Store has a $5 fee for uploading an extension, so that's why I didn't bother uploading it there.

[releases page]: https://github.com/tigerros/reddit-media-page-cleanup/releases
[latest release]: https://github.com/tigerros/reddit-media-page-cleanup/releases/latest