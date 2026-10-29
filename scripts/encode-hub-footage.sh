#!/bin/sh
# Encodes the hub's chapter footage from the drone clips in ground/drone/ (gitignored originals, cut with
# yt-dlp from InfraUnfiltered's videos, used with the creator's permission; see photos.json credits).
# Each clip plays forward then backward, so the loop has no jump. Kasheli (Line 5) is not used: its
# section carries the creator's picture-in-picture inset from the first frame; Line 5 keeps its still.
# Output: public/hub/footage/<name>-{1600.mp4,960.mp4,poster.jpg} (H.264 only: VP9 came out larger). Needs ffmpeg.
set -e
IN=ground/drone
OUT=public/hub/footage
mkdir -p "$OUT"
enc() { # name, input filter chain before scaling
  name=$1; pre=$2
  ffmpeg -v error -y -i "$IN/$name.webm" -filter_complex "[0:v]${pre}split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[v]" -map "[v]" -an -pix_fmt yuv420p -c:v libx264 -crf 18 -preset slow "$OUT/$name-master.mp4"
  ffmpeg -v error -y -i "$OUT/$name-master.mp4" -vf scale=1600:-2 -an -c:v libx264 -crf 31 -maxrate 2500k -bufsize 5000k -preset slow -movflags +faststart -pix_fmt yuv420p "$OUT/$name-1600.mp4"
  ffmpeg -v error -y -i "$OUT/$name-master.mp4" -vf scale=960:-2 -an -c:v libx264 -crf 31 -maxrate 900k -bufsize 1800k -preset slow -movflags +faststart -pix_fmt yuv420p "$OUT/$name-960.mp4"
  ffmpeg -v error -y -i "$OUT/$name-master.mp4" -vf scale=1600:-2 -frames:v 1 -q:v 4 "$OUT/$name-poster.jpg"
  rm "$OUT/$name-master.mp4"
  echo "$name done"
}
enc kapurbawdi "trim=0:8,setpts=PTS-STARTPTS,"
enc apmc-kalyan "trim=0:8,setpts=PTS-STARTPTS,"
enc manpada "trim=0:8,setpts=PTS-STARTPTS,"
ls -la "$OUT"
