# hugtight

**CLI for devs to turn twitter app/dev tokens into user tokens**

> Mr Twit was good at catching birds. On the day before Bird Pie day, he would put the ladder up against The Big Dead Tree and climb into the branches with a bucket of glue and a paint-brush. The glue he used was something called HUGTIGHT and it was stickier than any other glue in the world. He would paint it along the tops of all the branches and then go away.

![hugtight](img/mr_twit.jpg)

## usage

```sh
TWITTER_API_KEY=xxxxxx \
  TWITTER_API_SECRET=yyyyyyyyyy \
  TWITTER_ACCESS_TOKEN=zzzzzzz \
  TWITTER_ACCESS_TOKEN_SECRET=qqqqqqqqqq
  npx hugtight
```

use the tokens from your twitter app and your developer account and it'll walk you through getting credentials for a different user. when it's done, it'll print them out as env vars for you to use in other commands, like:

```
TWITTER_ACCESS_TOKEN=hualgahualghuahg
TWITTER_ACCESS_TOKEN_SECRET=a8os7ydna8sd7ya9s8nyda8yn77o
```

or, by setting the env var `HUGTIGHT_OUTFILE=<path>`, you can output that to an env file, like:

```sh
TWITTER_API_KEY=xxxxxx \
  TWITTER_API_SECRET=yyyyyyyyyy \
  HUGTIGHT_OUTFILE=.env \
  npx hugtight
```

### Notes

- Uses `dotenv` to get env vars, so if you don't pass 'em at the command line, it will use the api keys and other env vars in an `.env` file in the working directory if one exists.
- If outfile is specified, hugtight will attempt to append to any existing file there--so it's safe to output to the same .env file without overwriting!
