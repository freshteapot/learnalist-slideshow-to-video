'use strict';
import { chromium, devices } from 'playwright';
import fs from 'fs';
import { exec } from 'child_process';

import { expect } from '@playwright/test';

export class HttpException extends Error {
    constructor(status, body) {
        super(`${status} Error`);
        this.body = body;
        this.status = status;
    }
}

export const formatFfmpegDuration = async (durations) => {
    const files = durations.map((duration, index) => {
        const output = `file ${index}.png
duration ${duration}`;
        return output;
    });
    // Seem to need to add a file at the end
    files.push(`file ${durations.length - 1}.png`)

    return ["ffconcat version 1.0", ...files].join('\n');
}

export const waitAndclickNext = async (page) => {
    await page.waitForSelector("#play-screen button");
    await page.$$eval("#play-screen button", els => {
        const next = els.find(el => el.innerText == "Next");
        next.click();
    });
}

export const setup = async (opts) => {
    const browser = await chromium.launch({
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    });

    const context = await browser.newContext(
        {
            ...devices['iPhone 12 Mini'],
            //ignoreHTTPSErrors: true
        },
    );

    const page = await context.newPage();
    return { browser, page };
}

export const login = async (page, opt) => {
    const baseURL = opt.server;
    if (opt.auth.username !== '') {
        const { username, password } = opt.auth;
        await page.goto(`${baseURL}/login.html`);
        await page.getByLabel('Username').click();
        await page.getByLabel('Username').fill(username);
        await page.getByLabel('Username').press('Tab');
        await page.getByLabel('Password').fill(password);
        await page.getByRole('button', { name: 'Login' }).click();
        await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
    }

    if (opt.auth.token !== '') {
        const resp = await page.context().request.post(`${baseURL}/api/v1/user/token/to/cookie`, {
            data: {
                token: opt.auth.token,
                user_uuid: opt.auth.userUuid,
            }
        })
        // The context already gets the cookie.
        // Using below will return set-cookie as an object
        //console.log(await context.cookies());
        if (resp.status() !== 200) {
            if (resp.status() === 403) {
                throw new HttpException(403, 'Failed to login via token')
            }
            throw new HttpException(resp.status(), resp.statusText())
        }
    }
}

// https://github.com/Zenika/alpine-chrome/blob/master/with-playwright/src/useragent.js
export const downloadAssets = async (page, opt, directory) => {
    console.log("getting json + images");
    fs.rmSync(directory, { recursive: true, force: true });

    fs.mkdirSync(directory, { recursive: true });

    const baseURL = opt.server;
    const url = `${baseURL}/alist/${opt.uuid}.html#/play/slideshow`;

    const resp = await page.goto(url);
    if (resp.status() !== 200) {
        if (resp.status() === 404) {
            throw new HttpException(404, 'List not found')
        }

        if (resp.status() === 403) {
            throw new HttpException(403, 'Access denied')
        }
        throw new HttpException(resp.status(), resp.statusText())
    }


    // Get the list
    const aList = await page.$eval("#play-data", el => {
        return JSON.parse(el.innerText);
    });

    fs.writeFileSync(`${directory}/alist.json`, JSON.stringify(aList, null, 4));

    for (let index = 0; index < aList.data.length; index++) {
        await waitAndclickNext(page);
        const output = `${directory}/${index}.png`;
        // If we were to focus on the area then we need to figure out scaling of the image.
        // Taking the whole screen means we can cheat a little
        // This allows us to focus on the element
        // Some sort of magic, should make this easy, be it in svelte or here
        //const container = await page.$("#play-screen");
        //await container.screenshot({ path: output });
        await page.screenshot({ path: output });
    }
}

export const buildVideoAssets = async (opt, directory) => {
    var aList = JSON.parse(fs.readFileSync(`${directory}/alist.json`, 'utf8'));

    let duration = [...opt.config.duration];
    if (duration.length === 1) {
        duration = Array.from({ length: aList.data.length }).fill(duration[0], 0);
    }

    if (duration.length != aList.data.length) {
        throw new HttpException(422, 'Duration list is not the same length as the list data')
    }

    console.log(duration)
    const output = await formatFfmpegDuration(duration);

    fs.writeFileSync(`${directory}/in.ffconcat`, output);
}

export const execShellCommand = (cmd) => {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            resolve(stdout ? stdout : stderr);
        });
    });
}

export const makeVideo = async (directory) => {
    // TODO add fade out to buildSlideshow
    // https://gist.github.com/dvlden/b9d923cb31775f92fa54eb8c39ccd5a9
    // vsync vfr seems important
    // https://stackoverflow.com/questions/45999716/ffmpeg-concat-last-image-duration-incorrect
    // I wonder if I need audio
    console.log("building the video");
    const buildVideoCMD = `
ffmpeg -y \
-f concat \
-i ${directory}/in.ffconcat \
-vsync vfr \
-preset slow -codec:a libfdk_aac -b:a 128k -codec:v libx264 -pix_fmt yuv420p -b:v 4500k -minrate 4500k -maxrate 9000k -bufsize 9000k -vf scale=-2:1080 \
${directory}/output.mp4
`
    await execShellCommand(buildVideoCMD);
    return `${directory}/output.mp4`;
}

export const makePdf = async (directory) => {
    // TODO will fail without convert
    console.log("building the pdf");
    const buildPdfCMD = `convert ${directory}/*.png ${directory}/output.pdf`
    await execShellCommand(buildPdfCMD);
    return `${directory}/output.pdf`;
}
