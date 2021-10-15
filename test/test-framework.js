const chalk = require("chalk");
const nexpect = require("nexpect");

async function testSuite({ env: defaultEnv, cases: casesObj }) {
  const cases = Object.entries(casesObj);
  let casesRun = 0;
  let failures = 0;

  function getHeader(name) {
    return chalk.underline.yellowBright(
      `\nTest ${++casesRun} of ${cases.length}: ${name}`
    );
  }

  function testHandler(config = {}) {
    const { expectations = {}, env = {} } = config;
    return nexpect.spawn("./bin/hugtight", {
      env: {
        ...process.env,
        ...defaultEnv,
        ...env,
        NODE_OPTIONS: "--require ./test/test-runtime.js",
        HUGTIGHT_SUITE_EXPECTATIONS: JSON.stringify(expectations),
      },
      stream: "all",
      verbose: true,
    });
  }

  function testRunner(testFn) {
    return new Promise((res) => {
      try {
        testFn(testHandler).run((error, body, exit) => {
          res({ body, error, exit });
        });
      } catch (error) {
        res({ error, exit: NaN });
      }
    });
  }

  await cases.reduce(async (running, [name, testFn]) => {
    await running;
    console.log(getHeader(name));
    return testRunner(testFn).then((result) => {
      console.log(`Exit code ${result.exit}`);
      if (result.error) {
        failures++;
        const margin = chalk.red(" | ");
        console.log(
          ...(result.error.stack || result.error)
            .split("\n")
            .map((line) => margin + chalk.red(line))
        );
        console.log(chalk.redBright.underline(`[FAIL]`));
      } else {
        console.log(chalk.greenBright(`[PASS]`));
      }
    });
  }, Promise.resolve());
  console.log(chalk.whiteBright("\n——————————————————"));
  console.log(chalk.bold(`${cases.length} tests run`));
  console.log(chalk.bold.greenBright(`${cases.length - failures} passed`));
  if (failures) {
    console.log(chalk.bold.redBright(`${failures} failed`));
    process.exit(1);
  }
}

module.exports = testSuite;
testSuite.testSuite = testSuite;
