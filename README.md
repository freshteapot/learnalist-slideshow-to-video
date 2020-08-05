# Example that stitches images together and then makes a movie based on durations

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
}' | jq -c | node --experimental-modules pipe.js
```

# 1 duration for all
- 3 seconds per slide
```sh
echo '{
    "server": "https://learnalist.net",
    "uuid": "3e317b11-eebc-5cbc-8211-2047f47839da",
    "durations": ["3s"],
    "all": true
}' | jq -c | node --experimental-modules pipe.js
```
