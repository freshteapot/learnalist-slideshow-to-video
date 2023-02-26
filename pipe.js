'use strict';
import { makePdf, makeVideo, getJSONOutput, getOutput, HttpException, login, setup, downloadAssets, buildVideoAssets, } from './lib-playwright.js';
import { exit } from 'process';

const opts = {
    dir: "./data",
    server: "https://learnalist.net",
    auth: {
        username: process.env.LAL_USERNAME ?? '', // TODO Do I want this still?
        password: process.env.LAL_PASSWORD ?? '',
        token: '',
        userUuid: '',
    },
    debug: false,
    uuid: "", // TODO change to alistUuid
    config: {
        kind: "video",
        duration: [],
    }
}


var logger = function () {
    var oldConsoleLog = null;
    var pub = {};

    pub.enableLogger = function enableLogger() {
        if (oldConsoleLog == null)
            return;

        console.log = oldConsoleLog;
    };

    pub.disableLogger = function disableLogger() {
        oldConsoleLog = console.log;
        console.log = function () { };
    };

    return pub;
}();

process.stdin.resume();
process.stdin.setEncoding('utf8');

var stdin = process.openStdin();

var data = "";

stdin.on('data', function (chunk) {
    data += chunk
});

stdin.on('end', async function () {
    const cmdResponse = {
        status: 200,
        body: {},
    };

    try {
        const slideshow = JSON.parse(data);
        opts.dir = slideshow.dir ?? opts.dir;
        opts.auth.token = slideshow.auth.token ?? opts.auth.token;
        opts.auth.userUuid = slideshow.auth.userUuid ?? opts.auth.userUuid;
        opts.debug = slideshow.debug ?? opts.debug;
        opts.server = slideshow.server ?? opts.server;
        opts.uuid = slideshow.uuid ?? opts.uuid;

        opts.config = slideshow.config;

        if (!opts.debug) {
            logger.disableLogger();
        }

        const directory = `${opts.dir}/${opts.uuid}`;

        const { browser, page } = await setup(opts);

        await login(page, opts);
        await downloadAssets(page, opts, directory);
        if (opts.config.kind === "video") {
            await buildVideoAssets(opts, directory);
            const asset = await makeVideo(directory);
            cmdResponse.body = {
                asset
            }
        }

        if (opts.config.kind === "pdf") {
            const asset = await makePdf(directory);
            cmdResponse.body = {
                asset
            }
        }

        await browser.close();
        if (!opts.debug) {
            logger.enableLogger();
        }

        console.log(JSON.stringify(cmdResponse));
        exit(0);
    } catch (e) {
        cmdResponse.status = 500;

        cmdResponse.body = {
            message: '',
            error: {},
        };


        if (e instanceof HttpException) {
            cmdResponse.status = e.status;
            cmdResponse.body.message = e.body;
        } else {
            if (typeof e === "string") {
                cmdResponse.body.message = e;
            } else {
                cmdResponse.body.message = e.message ?? '';
                cmdResponse.body.error = e;
            }
        }

        console.log(JSON.stringify(cmdResponse));
        exit(1);
    }
});
