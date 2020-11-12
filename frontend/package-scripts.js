/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const fs = require("fs");
const shell = require("shelljs");
const pkg = require("./package.json");

const distFolderName = "build";
const distAbsPath = path.resolve(__dirname, `./${distFolderName}`);
// const reactScript = "react-app-rewired"; // provides HMR
const reactScript = "react-scripts";

const apiUrl = process.env.API_URL;
const webHost = process.env.WEB_PORT;

const dev_envs = `BROWSER=none EXTEND_ESLINT=true TSC_COMPILE_ON_ERROR=true REACT_APP_API_URL=${apiUrl} `;

const startServer = `yarn ${reactScript} start`;

const test_envs = `REACT_APP_API_URL=http://localhost:2222 IS_UNIT_TEST=true NODE_ENV=test`;

const test = `${test_envs} react-scripts test --runInBand`;

const cypressPreEnv = `CYPRESS_BASE_URL=http://localhost:${webHost}`;
const cypressPostEnv = `--env API_URL=${apiUrl}`;
const cypressPreEnvP = `CYPRESS_BASE_URL=http://localhost:${4022}`;

module.exports = {
  scripts: {
    dev: `${dev_envs} ${startServer}`,
    build: {
      default: {
        script: `rimraf ${distFolderName} && env-cmd -e prod react-scripts build`,
        description: "Build the app for production",
      },
    },
    deploy: {
      n: {
        script: `yarn start build && yarn start netlify`,
        description: "deploy to netlify",
      },
      l: {
        script: `yarn start build && yarn start serve`,
        description:
          "Test production build locally, serving using 'yarn serve'",
      },
    },
    serve: `env-cmd -e prod yarn serve --single ${distFolderName}`,
    cy: {
      default: {
        script: `${cypressPreEnv} cypress open \
           ${cypressPostEnv}`,
        description: "e2e test with frontend in dev mode/electron",
      },
      h: {
        script: `${cypressPreEnv} cypress run ${cypressPostEnv}`,
        description: "e2e test with frontend in dev mode/electron/headless",
      },
      hp: {
        script: `NODE_ENV=production ${cypressPreEnvP} \
          cypress run ${cypressPostEnv}`,
        description: "e2e: with frontend in production",
      },
      st: {
        script: ` start-server-and-test \
          'yarn start cy.s' 4022 \
          'yarn start cy.hp'`,
        description:
          "e2e: start server and test: frontend=production backend=dev",
      },
      s: {
        script: `yarn serve --single ${distFolderName} --listen=4022`,
      },
      b: {
        script: `rimraf ${distFolderName} && \
          REACT_APP_REGISTER_SERVICE_WORKER= REACT_APP_API_URL=${apiUrl} \
          NODE_ENV=production \
            react-scripts build`,
        description: "build for end to end test",
      },
    },
    test: {
      default: `CI=true ${test}`,
      d: `CI=true env-cmd ${test_envs} react-scripts --inspect-brk test --runInBand --no-cache  `, // debug
      dw: `${test_envs} react-scripts --inspect-brk test --runInBand --no-cache`, // debug watch
      // "node --inspect node_modules/.bin/jest --runInBand"
      w: test,
      wc: `${test} --coverage`,
      c: `rimraf coverage && CI=true ${test} --coverage --forceExit`,
    },
    serviceWorker: `node -e 'require("./package-scripts").serviceWorker()'`,
    netlify: `./node_modules/.bin/env-cmd -e prod \
        node -e 'require("./package-scripts").netlify()'`,
    tc: {
      default: "tsc --project .",
      c: {
        script: "tsc --project ./cypress",
        description: "Type check the cypress project",
      },
    },
    lint: "eslint . --ext .js,.jsx,.ts,.tsx",
    fgql: `node -e 'require("./package-scripts").fetchGqlTypes()'`,
  },
  serviceWorker() {
    const { copyWorkboxLibraries, injectManifest } = require("workbox-build");

    const workboxPath =
      "workbox-v" + pkg.devDependencies["workbox-build"].match(/(\d.+)/)[1];

    // remove unnecessary files generated by CRA
    shell.rm([
      `${distAbsPath}/service-worker.js`,
      `${distAbsPath}/static/js/*.LICENSE.txt`,
    ]);

    const swSrc = "service-worker.js";
    const swSrcAbsPath = path.resolve(__dirname, swSrc);
    const swTemplateSrc = path.resolve(__dirname, "service-worker.template.js");

    const swCode = fs
      .readFileSync(swTemplateSrc, "utf8")
      .replace(/%workboxPath%/g, workboxPath);

    fs.writeFileSync(swSrcAbsPath, swCode);

    copyWorkboxLibraries(distAbsPath);

    console.log(
      `\n*** copied workbox runtime libraries to "${path.resolve(
        distAbsPath,
        workboxPath,
      )}".`,
    );

    injectManifest({
      swSrc,
      swDest: `${distFolderName}/sw.js`,
      globDirectory: distFolderName,
      globPatterns: [
        "**/*.{js,css,png,svg,jpg,jpeg,ico,html,json}", //
      ],
      globIgnores: ["workbox-v*", "*.map", "precache-manifest.*"],
      // donnCacheBustURLsMatching: /(\.js$|\.css$|favicon.+ico$|icon-\d+.+png$)/,
    }).then(({ count, filePaths, size, warnings }) => {
      console.log(
        `\n*** ${count} files were preCached:\n\t${filePaths.join(
          "\t\n",
        )}\n*** total: ${size} bytes\n`,
      );

      if (warnings.length) {
        console.warn("--------WARNINGS-------\n", warnings, "\n");
      }

      shell.rm(swSrcAbsPath);
    });
  },
  netlify() {
    const NetlifyApi = require("netlify");
    const { siteId } = require("./.netlify/state.json");
    const token = process.env.NETLIFY_TOKEN;

    if (!token) {
      throw new Error('\n"NETLIFY_TOKEN" environment variable required!\n');
    }

    const netlifyClient = new NetlifyApi(token);

    console.log("\n***", "Deploying to netlify");

    netlifyClient
      .deploy(siteId, `./${distFolderName}`, {
        draft: false, // == production
      })
      .then((response) => {
        console.log(response);
      });
  },
  fetchGqlTypes() {
    const fetch = require("node-fetch");
    const exec = require("child_process").exec;

    const outputFilename = "./src/graphql/apollo-types/fragment-types.json";

    const query = `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `;

    shell.rm("-rf", "src/graphql/apollo-types");

    exec(
      `./node_modules/.bin/apollo client:codegen \
        --endpoint=${apiUrl} \
        --tagName=gql \
        --target=typescript \
        --includes=src/graphql/*.ts \
        --outputFlat=src/graphql/apollo-types
      `,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }

        console.log("\n");

        if (stdout) {
          console.log(`stdout:\n${stdout}`);
        }

        if (stderr) {
          console.log(`stderr:\n${stderr}`);
        }

        fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variables: {},
            query,
          }),
        })
          .then((result) => result.json())
          .then((result) => {
            // here we're filtering out any type information unrelated to unions or interfaces

            const unionTypes = result.data.__schema.types.reduce(
              (acc, { possibleTypes, name }) => {
                if (possibleTypes) {
                  acc[name] = possibleTypes.map(
                    ({ name: possibleTypeName }) => possibleTypeName,
                  );
                }

                return acc;
              },
              {},
            );

            fs.writeFile(outputFilename, JSON.stringify(unionTypes), (err) => {
              if (err) {
                console.error("Error writing fragmentTypes file", err);
              } else {
                console.log("Fragment types successfully extracted!");
              }
            });
          });
      },
    );
  },
};
