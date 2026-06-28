const ORIGIN = "https://examcrush-dun.vercel.app";

export default {
  async fetch(request) {
    const requestUrl = new URL(request.url);
    const originUrl = new URL(ORIGIN);
    const upstreamUrl = new URL(requestUrl.pathname + requestUrl.search, ORIGIN);
    const headers = new Headers(request.headers);

    headers.set("x-forwarded-host", requestUrl.host);
    headers.set("x-forwarded-proto", requestUrl.protocol.replace(":", ""));
    headers.delete("cf-connecting-ip");
    headers.delete("cf-ipcountry");
    headers.delete("cf-ray");
    headers.delete("cf-visitor");

    const init = {
      method: request.method,
      headers,
      redirect: "manual"
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
      init.duplex = "half";
    }

    const response = await fetch(upstreamUrl, init);
    const responseHeaders = new Headers(response.headers);
    const location = responseHeaders.get("location");

    if (location) {
      responseHeaders.set(
        "location",
        location.replace(originUrl.origin, requestUrl.origin)
      );
    }

    responseHeaders.set("x-examcrush-proxy", "cloudflare-pages");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  }
};
