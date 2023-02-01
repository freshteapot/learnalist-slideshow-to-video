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
-i in.ffconcat \
-preset slow -codec:a libfdk_aac -b:a 128k -codec:v libx264 -pix_fmt yuv420p -b:v 4500k -minrate 4500k -maxrate 9000k -bufsize 9000k -vf scale=-1:1080 \
output.mp4
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
