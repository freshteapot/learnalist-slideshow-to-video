'use strict';
//import { buildSlideshow, execShellCommand } from './lib-puppeteer.js';
import { buildSlideshow, execShellCommand } from './lib-playwright.js';
import { exit } from 'process';

const opts = {
    dir: "./data",
    server: "https://learnalist.net",
    auth: {
        username: process.env.LAL_USERNAME ?? '',
        password: process.env.LAL_PASSWORD ?? ''
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

var stdin = process.openStdin();

var data = "";

stdin.on('data', function (chunk) {
    data += chunk
});

stdin.on('end', async function () {
    try {
        const slideshow = JSON.parse(data);
        const directory = `${opts.dir}/${slideshow.uuid}`;

        console.log("getting the images");
        await buildSlideshow(opts, slideshow);

        console.log("building the video");
        const buildVideoCMD = `ffmpeg -y \
-i ${directory}/in.ffconcat \
-preset slow -codec:a libfdk_aac -b:a 128k -codec:v libx264 -pix_fmt yuv420p -b:v 4500k -minrate 4500k -maxrate 9000k -bufsize 9000k -vf scale=-1:1080 \
${directory}/output.mp4`

        await execShellCommand(buildVideoCMD);
        // TODO will fail without convert
        console.log("building the pdf");
        const buildPdfCMD = `convert ${directory}/*.png ${directory}/${slideshow.uuid}.pdf`
        await execShellCommand(buildPdfCMD);
        console.log(`

Your video is ready ✨

# Open video
open ${directory}/output.mp4

# Open pdf
open ${directory}/${slideshow.uuid}.pdf


finished

`);
        exit(0);
    } catch (e) {
        console.log("Somehting went wrong", e);
        exit(1);
    }
});
