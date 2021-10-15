const testSuite = require("./test-framework");
const camelspace = require("camelspace");
const { mockTwitter, twitter } = require("./fixtures.json");
const env = {
  ...camelspace("mockTwitter").toEnv(mockTwitter),
  ...camelspace("twitter").toEnv(twitter),
};

testSuite({
  env,
  cases: {
    ["happy path"]: (test) =>
      test()
        .wait(/^\s*>\s*$/m)
        .sendline("\n")
        .wait(/http/)
        .sendline(mockTwitter.pin)
        .wait(`Success! Access token for @${mockTwitter.screenName} obtained.`)
        .expect(/provided environment/im)
        .expect(`TWITTER_ACCESS_TOKEN=${mockTwitter.secondOauthToken}`)
        .expect(
          `TWITTER_ACCESS_TOKEN_SECRET=${mockTwitter.secondOauthTokenSecret}`
        )
        .sendEof(),
    ["invalid pin a couple times"]: (test) =>
      test()
        .wait(/^\s*>\s*$/m)
        .sendline("\n")
        .wait(/http/)
        .sendline("huahghguahg")
        .wait(/try again/i)
        .sendline("45678")
        .expect(/exchanging pin/i)
        .expect(
          `Success! Access token for @${mockTwitter.screenName} obtained.`
        )
        .sendEof(),
    ["throw exception if twitter creds aren't there"]: (test) =>
      test({ env: { TWITTER_API_KEY: "" } }).expect(/api key/i),
  },
});
