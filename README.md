# Example that stitches images together and then makes a movie based on durations

# Prerequisite
- Install ffmpeg
- Install imagemagick (convert)
- Install Node (runs on 19.5) etc

```sh
brew install ffmpeg
```

```sh
ffmpeg -y \
-f concat \
-i in.ffconcat \
-vsync vfr \
-preset slow -codec:a libfdk_aac -b:a 128k -codec:v libx264 -pix_fmt yuv420p -b:v 4500k -minrate 4500k -maxrate 9000k -bufsize 9000k -vf scale=-2:1080 \
output.mp4
```

```sh
ffmpeg -y \
-f concat \
-i in.ffconcat \
-vsync vfr \
-preset slow -codec:v libx264 -pix_fmt yuv420p -vf scale=-2:1080 \
output.mp4
```

```sh
ffmpeg -f concat -i in.ffconcat -y -vf fps=10 -crf 22 -threads 2 -preset veryfast -pix_fmt yuv420p output.mp4
```

# Build based on indvidual durations
```sh
echo '{
    "server": "https://learnalist.net",
    "uuid": "3e317b11-eebc-5cbc-8211-2047f47839da",
    "durations": ["600ms", "1000ms", "600ms", "600ms", "600ms", "600ms", "600ms"],
    "all": false
}' | jq -c | node pipe.js
```

# 1 duration for all
- 3 seconds per slide
```sh
echo '{
    "server": "https://learnalist.net",
    "uuid": "3e317b11-eebc-5cbc-8211-2047f47839da",
    "durations": ["3s"],
    "all": true
}' | jq -c | node pipe.js
```

# Playwright
✔ Success! Created a Playwright Test project at /Users/freshteapot/git/learnalist-slideshow-to-video

Inside that directory, you can run several commands:

  npx playwright test
    Runs the end-to-end tests.

  npx playwright test --project=chromium
    Runs the tests only on Desktop Chrome.

  npx playwright test example
    Runs the tests in a specific file.

  npx playwright test --debug
    Runs the tests in debug mode.

  npx playwright codegen
    Auto generate tests with Codegen.

We suggest that you begin by typing:

    npx playwright test

And check out the following files:
  - ./e2e/example.spec.ts - Example end-to-end test
  - ./tests-examples/demo-todo-app.spec.ts - Demo Todo App end-to-end tests
  - ./playwright.config.ts - Playwright Test configuration

Visit https://playwright.dev/docs/intro for more information. ✨

Happy hacking! 🎭



# Whip up a pdf

```sh
convert ./data/3e317b11-eebc-5cbc-8211-2047f47839da/page*.png ./data/3e317b11-eebc-5cbc-8211-2047f47839da/3e317b11-eebc-5cbc-8211-2047f47839da.pdf
```


echo '{
    "server": "https://learnalist.net",
    "uuid": "4be3f7c4-a7ea-52b7-a0e9-7d60a20b828e",
    "durations": ["3s"],
    "all": true
}' | jq -c | node pipe.js





docker build -f Dockerfile.alpine -t learnalist-slideshow-to-video-base:latest .

docker build -f Dockerfile.slideshow -t learnalist-slideshow-to-video:latest .

echo '{
    "dir":"/app/output",
    "server": "https://learnalist.net",
    "uuid": "3e317b11-eebc-5cbc-8211-2047f47839da",
    "durations": ["600ms", "1000ms", "600ms", "600ms", "600ms", "600ms", "600ms"],
    "all": false
}' | jq -c | docker run -v $(PWD)/data:/app/output -i --rm learnalist-slideshow-to-video:latest

Chrome is in the image

# Didnt work
-v $(PWD)/node_modules/playwright-core/.local-browsers:/ms-playwright
# PLAYWRIGHT_BROWSERS_PATH=./browsers npx playwright install chromium


# References
- https://github.com/Zenika/alpine-chrome/blob/master/with-playwright/Dockerfile
- https://peter.sh/experiments/chromium-command-line-switches/



"9a8dd97a-b0b2-4d43-a4c7-885bb42c943a"


echo '{
    "server": "https://learnalist.dev:8443",
    "uuid": "65e49424-dbf1-5d2b-a102-4ec9743db16f",
    "durations": ["3s"],
    "all": true,
    "auth": {
      "token": "71010d7e-f7ae-42f1-ba34-e5c5a787fe89",
      "userUuid": "9a8dd97a-b0b2-4d43-a4c7-885bb42c943a"
    }
}' | jq -c | node pipe.js



# Run in docker
- need to use https, it is so much easier
- I wonder if this will work in the cluster?
```sh
mkdir -p /tmp/slideshow/data
telepresence intercept make-slideshow -p 8082:80 --docker-run -- \
  --rm \
        -v "/tmp/slideshow/data:/app/output" \
  -v "/Users/freshteapot/git/learnalist-api/config/dev.config.yaml:/app/config.yaml" \
  -e 'TOPIC=lal.slideshow' \
  -e 'EVENTS_STAN_CLIENT_ID=make-slideshow' \
  -e 'EVENTS_STAN_CLUSTER_ID=stan' \
  -e 'EVENTS_NATS_SERVER=nats' \
  -e 'SERVER_CONFIG=/app/config.yaml' \
  -e 'SERVER_BASEURL=https://dev.learnalist.net' \
  -e 'SLIDESHOW_DATA_DIRECTORY=/app/output' \
  -e 'SLIDESHOW_ENTRYPOINT=/app/pipe.js' \
  -e 'SLIDESHOW_DEBUG=false' \
  learnalist-slideshow-to-video:latest \
  tools make-slideshow
```

TODO: fix this in the go code in the input then all the way thru
```sh
echo  '{
  "dir": "./data",
  "server": "https://dev.learnalist.net",
  "uuid": "6cc858ca-aa76-5664-8134-9801225f6704",
  "auth": {
    "token": "dd1d2617-1179-4348-ab2f-e65b0be331b5",
    "userUuid": "f8a643dd-e2b9-4bf6-ae09-5db692f4c578"
  },
  "debug": true,
  "config": {
    "kind": "video",
    "duration": [
      "3s"
    ]
  }
}' | node pipe.js
```


```sh
echo  '{
  "dir": "./data",
  "server": "https://dev.learnalist.net",
  "uuid": "6cc858ca-aa76-5664-8134-9801225f6704",
  "auth": {
    "token": "dd1d2617-1179-4348-ab2f-e65b0be331b5",
    "userUuid": "f8a643dd-e2b9-4bf6-ae09-5db692f4c578"
  },
  "debug": true,
  "config": {
    "kind": "pdf"
  }
}' | node pipe.js
```
