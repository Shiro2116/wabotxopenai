const fs = require('fs');
const { exit } = require('process');
const { Stream } = require('stream');
const ytdl = require('ytdl-core');


function youtubevideo(client, ytlinkv, ytvideostatus) {
    if (ytvideostatus == 1) {
        const fs = require('fs');
        console.log(ytlinkv)
        ytdl(ytlinkv).pipe(fs.createWriteStream('/root/wabot/youtube/video.mp4')).on('finish', function () {
            client.sendImage("31637603402@c.us", "/root/wabot/youtube/video.mp4");
            client.sendText("31637603402@c.us", "Ik heb je video gedownload🎉 Ik verstuur het nu");
            console.log('Download finished.');
            ytvideostatus = 2;
        })
    }

    return;
}

module.exports = { youtubevideo };