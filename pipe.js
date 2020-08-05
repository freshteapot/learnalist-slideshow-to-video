'use strict';
import { buildSlideshow, execShellCommand } from './lib.js';
import { exit } from 'process';

const opts = {
    dir: "./data",
    server: "https://learnalist.net"
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
        console.log("Your video location is:")
        console.log(`open ${directory}/output.mp4`);
        console.log("finished");
        exit(0);
    } catch (e) {
        console.log("Somehting went wrong", e);
        exit(1);
    }
});

