/*
 * MMM-OnSpotify
 * MIT license
 *
 * By Fabrizio <3 (Fabrizz) | https://github.com/Fabrizz/MMM-OnSpotify
 * Original implementation: Raywo | https://github.com/raywo/MMM-NowPlayingOnSpotify
 */

// Use node fetch as most MM2 installs use older node
const fetch = require("node-fetch");
const tokenRefreshBase = "https://accounts.spotify.com";
const userBase = "https://api.spotify.com";

module.exports = class SpotifyFetcher {
  constructor(payload) {
    this.credentials = payload.credentials;
    this.preferences = payload.preferences;
    this.language = payload.language;
    this.tokenExpiresAt = Date.now();
    this.errorCount = 0;
    this.showErrorEvery = 14;
  }

  async getData(type) {
    const currentTime = Date.now();
    if (currentTime < this.tokenExpiresAt) {
      return this.requestData(type);
    } else {
      let res = await this.refreshAccessToken();
      if (res) {
        console.log(
          "[MMM-NPOS] [Node Helper] Access token expired: >> \x1b[46m%s\x1b[0m",
          `${this.formatTime(this.tokenExpiresAt)}`,
        );
      }
      this.credentials.accessToken = res.access_token;
      this.tokenExpiresAt = currentTime + res.expires_in * 1000;
      return this.requestData(type);
    }
  }

  formatTime(milliseconds) {
    const formattedTime = new Date(milliseconds).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return formattedTime === "Invalid date" ? milliseconds : formattedTime;
  }

  requestData(type) {
    let sl = "v1/me/top/artists?limit=9";
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${this.credentials.accessToken}`);
    // TODO: Check if using &locale= (or &market=) has any different effect, as its not documented correctly
    if (this.language) headers.append("Accept-Language", this.language);
    switch (type) {
      case "PLAYER":
        return fetch(
          new URL("v1/me/player?additional_types=track,episode", userBase),
          {
            method: "GET",
            referrerPolicy: "no-referrer",
            headers: headers,
          },
        )
          .then((res) => {
            if (!res.ok && res.status === 429)
              console.warn(
                "\x1b[43m%s\x1b[0m",
                "[MMM-NPOS] [Node Helper] Get player Data >> ",
                "You are being rate limited by Spotify (429). Use only one SpotifyApp per module/implementation",
              );

            this.errorCount = 0;
            if (res.statusText === "No Content") return null;
            return res.body ? res.json() : null;
          })
          .catch((error) => {
            this.errorCount++;
            if (this.errorCount % this.showErrorEvery === 0)
              console.error(
                "\x1b[41m%s\x1b[0m",
                `[MMM-NPOS] [Node Helper] (${this.errorCount}) Get player Data >> `,
                error,
              );
            return error;
          });
      case "USER":
        return fetch(new URL("v1/me", userBase), {
          method: "GET",
          referrerPolicy: "no-referrer",
          headers: headers,
        })
          .then((res) => {
            if (!res.ok && res.status === 429)
              console.warn(
                "\x1b[43m%s\x1b[0m",
                "[MMM-NPOS] [Node Helper] Get User Data >> ",
                "You are being rate limited by Spotify (429). Use only one SpotifyApp per module/implementation",
              );

            this.errorCount = 0;
            return res.body ? res.json() : null;
          })
          .catch((error) => {
            this.errorCount++;
            if (this.errorCount % this.showErrorEvery === 0)
              console.error(
                "\x1b[41m%s\x1b[0m",
                `[MMM-NPOS] [Node Helper](${this.errorCount}) Get User Data >> `,
                error,
              );
            return error;
          });
      case "QUEUE":
        return fetch(new URL("v1/me/player/queue", userBase), {
          method: "GET",
          referrerPolicy: "no-referrer",
          headers: headers,
        })
          .then((res) => {
            if (!res.ok && res.status === 429)
              console.warn(
                "\x1b[43m%s\x1b[0m",
                "[MMM-NPOS] [Node Helper] Get Queue Data >> ",
                "You are being rate limited by Spotify (429). Use only one SpotifyApp per module/implementation",
              );

            this.errorCount = 0;
            return res.body ? res.json() : null;
          })
          .catch((error) => {
            this.errorCount++;
            if (this.errorCount % this.showErrorEvery === 0)
              console.error(
                "\x1b[41m%s\x1b[0m",
                `[MMM-NPOS] [Node Helper] (${this.errorCount}) Get Queue Data >> `,
                error,
              );
            return error;
          });
      case "AFFINITY":
        if (this.preferences.userAffinityUseTracks)
          sl = "v1/me/top/tracks?limit=9";
        return fetch(new URL(sl, userBase), {
          method: "GET",
          referrerPolicy: "no-referrer",
          headers: headers,
        })
          .then((res) => {
            if (!res.ok && res.status === 429)
              console.warn(
                "\x1b[43m%s\x1b[0m",
                "[MMM-NPOS] [Node Helper] Get Affinity Data >> ",
                "You are being rate limited by Spotify (429). Use only one SpotifyApp per module/implementation",
              );

            this.errorCount = 0;
            return res.body ? res.json() : null;
          })
          .catch((error) => {
            this.errorCount++;
            if (this.errorCount % this.showErrorEvery === 0)
              console.error(
                "\x1b[41m%s\x1b[0m",
                `[MMM-NPOS] [Node Helper] (${this.errorCount}) Get Affinity Data >> `,
                error,
              );
            return error;
          });
      case "RECENT":
        return fetch(new URL("v1/me/player/recently-played", userBase), {
          method: "GET",
          referrerPolicy: "no-referrer",
          headers: headers,
        })
          .then((res) => {
            if (!res.ok && res.status === 429)
              console.warn(
                "\x1b[43m%s\x1b[0m",
                "[MMM-NPOS] [Node Helper] Get Recently-Played Data >> ",
                "You are being rate limited by Spotify (429). Use only one SpotifyApp per module/implementation",
              );

            this.errorCount = 0;
            return res.body ? res.json() : null;
          })
          .catch((error) => {
            this.errorCount++;
            if (this.errorCount % this.showErrorEvery === 0)
              console.error(
                "\x1b[41m%s\x1b[0m",
                `[MMM-NPOS] [Node Helper] (${this.errorCount}) Get Recently-Played Data >> `,
                error,
              );
            return error;
          });
    }
  }

  refreshAccessToken() {
    let client_id = this.credentials.clientId;
    let client_secret = this.credentials.clientSecret;
    let refresh_token = this.credentials.refreshToken;

    return fetch(new URL("api/token", tokenRefreshBase), {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      }),
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${client_id}:${client_secret}`,
        ).toString("base64")}`,
      },
    })
      .then((res) => {
        if (!res.ok && res.status === 429)
          console.warn(
            "\x1b[43m%s\x1b[0m",
            "[MMM-NPOS] [Node Helper] Refresh access token >> ",
            "You are being rate limited by Spotify (429). Use only one SpotifyApp per module/implementation",
          );
        return res.json();
      })
      .catch((error) => {
        console.error(
          "\x1b[41m%s\x1b[0m",
          "[MMM-NPOS] [Node Helper] Refresh access token >> ",
          error,
        );
        return error;
      });
  }
};
