'use strict';
import puppeteer from 'puppeteer';
import fs from 'fs';
import { exec } from 'child_process';


async function formatFfmpegDuration(durations) {
    const files = durations.map((duration, index) => {
        const output = `file ${index}.png
duration ${duration}`;
        return output;
    });

    return ["ffconcat version 1.0", ...files].join('\n');
}

async function waitAndclickNext(page) {
    await page.waitForSelector("#play-screen button");
    await page.$$eval("#play-screen button", els => {
        const next = els.find(el => el.innerText == "Next");
        next.click();
    });
}

async function buildSlideshow(opt, slideshow) {
    const directory = `${opt.dir}/${slideshow.uuid}`;
    fs.rmdirSync(directory, { recursive: true });
    fs.mkdirSync(directory, { recursive: true });


    const baseURL = slideshow.server ? slideshow.server : opt.server;
    const url = `${baseURL}/alist/${slideshow.uuid}.html#/play/slideshow`;
    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    // This might be an area we tweak
    await page.setViewport({ width: 800, height: 800, deviceScaleFactor: 2 });

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
        console.log(slideshow);
    }


    for (let index = 0; index < aList.data.length; index++) {
        waitAndclickNext(page);
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

function execShellCommand(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
            }
            resolve(stdout ? stdout : stderr);
        });
    });
}

export {
    formatFfmpegDuration,
    waitAndclickNext,
    buildSlideshow,
    execShellCommand
}
