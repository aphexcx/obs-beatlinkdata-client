#!/usr/bin/env node

const express = require('express');
const expressws = require('express-ws');
const multer = require('multer');
let upload = multer({storage: multer.memoryStorage()});

const path = require('path');

const mdns = require('mdns');
// advertise our server on port 8080
const ad = mdns.createAdvertisement(mdns.tcp('_beatlinkdata'), 8080);
ad.start();

const app = express();
const wsapp = expressws(app);

let curTrack;

const sendCurrentTrack = () => {
    if (curTrack) {
        for (let c of wsapp.getWss().clients) {
            c.send(JSON.stringify({
                title: curTrack.title,
                artist: curTrack.artist,
                albumArt: curTrack.albumArt
            }));
        }
    }
};

app
    .use(express.json())
    .get('/', (req, res) => {
        res.sendFile(path.resolve("public", 'OBS_browser_overlay.html'));

    })
    .use(express.static('public'))
    .ws('/', (ws, req) => {
        ws.on('message', msg => {
            console.log('ws: ' + msg);
        });
        console.log('Websocket Connected');
        sendCurrentTrack()
    })
    .post('/currentTrack', (req, res, next) => {
        curTrack = req.body
        res.send({'success': true});
    })
    .post('/currentAlbumArt', upload.single('image'), (req, res, next) => {
        curTrack.albumArt = req.file.buffer.toString('base64')
        sendCurrentTrack()
        res.send({'success': true});
    })
    .use(function (err, req, res, next) {
        console.log('This is the invalid field ->', err.field)
        next(err)
    })
    .listen(8080);

