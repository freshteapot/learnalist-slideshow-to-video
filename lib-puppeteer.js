'use strict';
import puppeteer from 'puppeteer';
import fs from 'fs';
import { exec } from 'child_process';


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
    fs.rm(directory, { recursive: true, force: true })
    fs.rmdirSync(directory, { recursive: true });
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
