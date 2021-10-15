const assert = require("assert");
const { mockTwitter, twitter } = require("./fixtures.json");
const nock = require("nock");

nock("https://api.twitter.com")
  .post("/oauth/request_token")
  .reply(function () {
    assert.match(this.req.headers.authorization, new RegExp(twitter.apiKey));
    return [
      200,
      {
        oauth_token: mockTwitter.oauthToken,
      },
    ];
  })
  .post("/oauth/access_token")
  .reply(function () {
    assert.match(
      this.req.headers.authorization,
      new RegExp(mockTwitter.oauthToken)
    );
    assert.match(this.req.headers.authorization, new RegExp(mockTwitter.pin));
    return [
      200,
      {
        screen_name: mockTwitter.screenName,
        oauth_token: mockTwitter.secondOauthToken,
        oauth_token_secret: mockTwitter.secondOauthTokenSecret,
      },
    ];
  });
