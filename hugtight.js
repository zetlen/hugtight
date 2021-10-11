function hugtight() {
  require("dotenv").config();
  const readline = require("readline");
  const camelspace = require("camelspace");
  const { TwitterClient } = require("twitter-api-client");
  const chalk = require("chalk");

  async function ask(prompt) {
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      try {
        rl.question(
          prompt + chalk.bold.yellowBright.bgBlack("> "),
          (answer) => {
            rl.close();
            resolve(answer);
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  }

  let taskNum = 0;
  function instruct(task) {
    const bullet = chalk.green(` Step ${++taskNum}.`);
    const desc = chalk.yellowBright(task);
    return chalk.bold.bgBlack(`${bullet} ${desc}\n`);
  }

  function narrate(...args) {
    console.log(chalk.gray.bgBlack(...args));
  }
  
  function die(msg) {
    console.error(chalk.bold.red(msg));
    process.exit(1)
  }

  async function main() {
    if (!process.stdout.isTTY) {
        die("hugtight is an interactive script and will not run outside a terminal window");
    }

    const {
      twitter: appAuth = {},
      hugtight: { outfile },
    } = camelspace.of(["twitter", "hugtight"]);
    
    const twitter = new TwitterClient(appAuth);

    narrate("You're gonna help me get the rights to post as a Twitter user.");

    await ask(
      instruct(
        "In your browser, log in to the Twitter account that you want the bot to use. Press <Enter> when done."
      )
    );

    narrate("Getting Twitter OAuth request token on behalf of app...");
    const requestToken = await twitter.basics.oauthRequestToken({
      oauth_callback: "oob",
      x_auth_access_type: "write",
    });

    const redirectUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${requestToken.oauth_token}`;

    let pin = await ask(
      instruct(`Click the link below.
    ${chalk.blueBright(redirectUrl)}
  You may be asked to authorize the app. Once you have done so, it will show you a several-digit PIN number. Type or paste that PIN here and press <Enter>.`)
    );

    while (isNaN(Number(pin))) {
      pin = await ask(
        chalk.redBright("  ❌ Doesn't look like a PIN to me. Try again.")
      );
    }

    narrate("Exchanging PIN for access token...");
    const accountAuth = await twitter.basics.oauthAccessToken({
      oauth_token: requestToken.oauth_token,
      oauth_verifier: pin,
    });

    const account = chalk.blueBright("@" + accountAuth.screen_name);

    narrate(
      chalk.green(`  ✅ Success! Access token for ${account} obtained.\n`)
    );

    const userTokenVars = `TWITTER_API_KEY=${appAuth.apiKey}
TWITTER_API_SECRET=${appAuth.apiSecret}
TWITTER_ACCESS_TOKEN=${accountAuth.oauth_token}
TWITTER_ACCESS_TOKEN_SECRET=${accountAuth.oauth_token_secret}
`;

    if (outfile) {
      const { writeFileSync, constants: c } = require("fs");
      writeFileSync(outfile, userTokenVars, {
        encoding: "utf8",
        mode: c.S_IRUSR | c.S_IWUSR,
        flag: c.O_APPEND | c.O_DSYNC,
      });
      narrate(
        `Wrote env vars to "${outfile}". Use them to tweet as ${account}.`
      );
    } else {
      console.log(
        instruct(
          `To tweet as ${account}, use the following environment variables when running the Twitter client in the bot server:`
        ) +
          `
${userTokenVars}

${chalk.greenBright("Done.")}
`
      );
    }
  }

  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
module.exports = hugtight;
