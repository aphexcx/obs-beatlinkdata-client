#!/usr/bin/env node

const express = require('express');
const expressws = require('express-ws');
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
                artist: curTrack.artist
            }));
        }
    }
};

app
    .use(express.json())
    .get('/', (req, res) => {
        res.sendFile(path.resolve('OBS_browser_overlay.html'));

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
        sendCurrentTrack()
        res.send({'success': true});
    })
    .listen(8080);

