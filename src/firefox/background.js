"use strict";

/** @type {string} */
const ALL_SCHEMAS = "*://";
/** @type {string} */
const ALL_PATHS  = "/*";
/** @type {string} */
const I_REDD_IT = "i.redd.it";
/** @type {string} */
const PREVIEW_REDD_IT = "preview.redd.it";
/** @type {string} */
const EXTERNAL_PREVIEW_REDD_IT = "external-preview.redd.it";
/** @type {string} */
const WWW_REDDIT_COM = "www.reddit.com";
/** @type {string} */
const MEDIA_PATH = "/media";

// ^(?:.*?)www\.reddit\.com\/media\?url=https(?:%3A|:)(?:\/\/|%2F%2F)(.+?)\.redd\.it(?:\/|%2F)(.*?)(?:\?|%3F)(\w+)(=|%3D)(.+?)(&|%26)(\w+)(=|%3D)(.+?)

/**
 * These are the only URLs which will be intercepted in the first place.
 * @type {(string)[]}
 */
const INTERCEPTED_URLS = [
    ALL_SCHEMAS + I_REDD_IT + ALL_PATHS,
    ALL_SCHEMAS + PREVIEW_REDD_IT + ALL_PATHS,
    ALL_SCHEMAS + EXTERNAL_PREVIEW_REDD_IT + ALL_PATHS,
    ALL_SCHEMAS + WWW_REDDIT_COM + MEDIA_PATH + "?url=*",
];

/**
 * Represents the only hostnames which will trigger redirection when requesting `reddit.com/media?url=*`.
 * @type {(string)[]}
 */
const MEDIA_QUERY_INTERCEPTED_HOSTNAMES = [
    I_REDD_IT,
    PREVIEW_REDD_IT,
    EXTERNAL_PREVIEW_REDD_IT,
];

/**
 * See the README.
 * @param {browser.webRequest._OnBeforeSendHeadersDetails}  request
 * @returns {browser.webRequest.BlockingResponse}
 */
function rewriteAcceptHeader(request) {
    /** @type {URL} */
    const url = new URL(request.url);

    // We only want to alter the requests if the user requested them as a page,
    // rather than modifying every request even if they're just in a page.
    // For example, when the user visits "reddit.com", there are going to be a lot of "preview.redd.it" and
    // "external-preview.redd.it" files, because they are part of the feed.
    // However, we only want to modify the requests when the user directly goes to "preview.redd.it" (or others),
    // rather than that image simply being embedded in a page.
    if (request.type !== "main_frame") {
        // This is an exception to block the favicon.
        // We want to only block it when it's part of a page (like "i.redd.it").
        // The reason is that the stripped "i.redd.it" pages and others don't have a favicon, so this simply slows loading time.
        // If the user goes to "https://i.redd.it/favicon.ico", `request.type` will not be "image".
        // However, if the user went to a picture hosted on "i.redd.it", the `request.type` will be "image".
        if ((url.hostname === I_REDD_IT || url.hostname === EXTERNAL_PREVIEW_REDD_IT) && url.pathname === "/favicon.ico" && request.type === "image") {
            return { redirectUrl: "moz" };
        }

        return {};
    }

    // Clear Accept headers, they will default to the image file.
    request.requestHeaders.forEach(function (header) {
        if (header.name.toLowerCase() === "accept") {
            header.value = "";
        }
    });

    // DO NOT CLEAR ANY QUERY PARAMETERS. They are necessary on sh.reddit.com
    if (url.hostname === PREVIEW_REDD_IT) {
        url.hostname = I_REDD_IT;

        return { redirectUrl: url.toString(), requestHeaders: request.requestHeaders };
    } else if (url.hostname === WWW_REDDIT_COM && url.pathname === MEDIA_PATH) {
        /** @type {string} */
        let externalPreviewUrlParam = url.searchParams.get("url");

        // "reddit.com/media" links as visited from Reddit apps have a "?url" parameter,
        // but if it doesn't exist, we don't want to redirect to a null URL.
        if (externalPreviewUrlParam === null) {
            return {};
        }

        /** @type {URL} */
        let externalPreviewUrl;

        try {
            externalPreviewUrl = new URL(externalPreviewUrlParam);
        } catch (_) {
            // If the URL was not valid, we don't want to redirect
            return {};
        }

        // Very important! As discussed, there is a "?url" parameter.
        // It is important to check if that parameter is one of the hostnames that we care about.
        // Those hostnames are all Reddit image URLs.
        // Without this if statement, unexpected behavior would arise.
        // For example, "reddit.com/media?url=https://www.wikipedia.org" would redirect to "https://www.wikipedia.org".
        // It's unlikely for that to occur, but possible.
        if (!MEDIA_QUERY_INTERCEPTED_HOSTNAMES.includes(externalPreviewUrl.hostname)) {
            return {};
        }

        return { redirectUrl: externalPreviewUrl.href, requestHeaders: request.requestHeaders };
    }

    return { requestHeaders: request.requestHeaders };
}

browser.webRequest.onBeforeSendHeaders.addListener(
    rewriteAcceptHeader,
    { urls: INTERCEPTED_URLS },
    ["blocking", "requestHeaders"]
);
