'use strict';
import { chromium, devices } from 'playwright';
import fs from 'fs';
import { exec } from 'child_process';

import { expect } from '@playwright/test';

export const formatFfmpegDuration = async (durations) => {
    const files = durations.map((duration, index) => {
        const output = `file ${index}.png
duration ${duration}`;
        return output;
    });

    return ["ffconcat version 1.0", ...files].join('\n');
}

export const waitAndclickNext = async (page) => {
    await page.waitForSelector("#play-screen button");
    await page.$$eval("#play-screen button", els => {
        const next = els.find(el => el.innerText == "Next");
        next.click();
    });
}

export const buildSlideshow = async (opt, slideshow) => {
    const directory = `${opt.dir}/${slideshow.uuid}`;
    fs.rmSync(directory, { recursive: true, force: true });

    fs.mkdirSync(directory, { recursive: true });
    // If we wanted it to work on non-public pages
    // slideshow toolbox
    //  we record the required js in manifest_js
    //  we can bootstrap the slideshow with the data from the list

    // Only works on public pages
    const baseURL = slideshow.server ? slideshow.server : opt.server;
    const url = `${baseURL}/alist/${slideshow.uuid}.html#/play/slideshow`;

    // Maybe I want to emulate iphone
    // https://pptr.dev/#?product=Puppeteer&version=v8.0.0&show=api-pageemulateoptions
    // https://pptr.dev/#?product=Puppeteer&version=v8.0.0&show=api-puppeteerlaunchoptions
    // defaultViewport
    // https://stackoverflow.com/questions/57368020/how-to-use-puppeteer-to-turn-chromium-on-in-mobile-debug-mode
    const browser = await chromium.launch();
    //const context = await browser.newContext(devices['iPhone 12 Mini landscape']);
    const context = await browser.newContext(devices['iPhone 12 Mini']);
    //const page = await browser.newPage();

    const page = await context.newPage();

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

    // This might be an area we tweak
    //await page.setViewportSize({ width: 800, height: 800 });

    await page.goto(url);

    // Get the list
    const aList = await page.$eval("#play-data", el => {
        return JSON.parse(el.innerText);
    });

    // Loop over the slideshow, time is not important here, as we stitch it
    // together in the video

    if (slideshow.all === false) {
        console.log("Using duration per list items");
        if (slideshow.durations.length != aList.data.length) {
            throw 'Duration list is not the same length as the list data';
        }
    }

    if (slideshow.all === true) {
        console.log("Using one duration for all list items");
        if (!slideshow.durations[0]) {
            throw 'Duration is not set';
        }
        slideshow.durations = Array.from({ length: aList.data.length }).fill(slideshow.durations[0], 0);
    }


    for (let index = 0; index < aList.data.length; index++) {
        await waitAndclickNext(page);
        const output = `${directory}/${index}.png`;
        // This allows us to focus on the element
        // Some sort of magic, should make this easy, be it in svelte or here
        //const container = await page.$("#play-screen");
        //await container.screenshot({ path: output });
        await page.screenshot({ path: output });
    }

    const output = await formatFfmpegDuration(slideshow.durations);

    fs.writeFileSync(`${directory}/in.ffconcat`, output);
    await browser.close();
}

export const execShellCommand = (cmd) => {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
            }
            resolve(stdout ? stdout : stderr);
        });
    });
}
