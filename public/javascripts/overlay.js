/**
 * OBS Overlay
 */
const SERVER = 'ws://localhost:8080';
console.log('Triode Twitch DJ - OBS Overlay');

/**
 * Formats the track name.
 * @param {TrackInfo} track
 */
const formatTitle = (track) => {
    if (!track.title) return 'No Track Loaded';
    return track.title;
};

/**
 * Formats the track artist.
 * @param {TrackInfo} track
 */
const formatArtist = (track) => {
    if (!track.artist) return 'NO ARTIST LOADED';
    return track.artist.toUpperCase();
};

/**
 * Formats the record label.
 * @param {TrackInfo} track
 */
const formatLabel = (track) => {
    if (!track.label) return '[NO RECORD LABEL LOADED]';
    return `[${track.label.toUpperCase()}]`;
};

const updateTrack = (track) => {
    const title = formatTitle(track);
    const artist = formatArtist(track);
    const titleEl = document.querySelector('#title');
    const artistEl = document.querySelector('#artist');
    const albumArtEl = document.querySelector('#albumArt');
    const overlay = document.querySelectorAll('.fade');

    if (titleEl.innerHTML === title && artistEl.innerHTML === artist)
        return;

    // Fade out the old track title.
    overlay.forEach((el) => {
        el.style.opacity = 0;
    });

    let base64 = track.albumArt;
    let buffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    let blob = new Blob([buffer], {type: "image/png"});
    let artUrl = URL.createObjectURL(blob);

    // Fade in the new trace.
    setTimeout(() => {
        titleEl.innerHTML = title;
        artistEl.innerHTML = artist;
        albumArtEl.src = artUrl;
        overlay.forEach((el) => {
            el.style.opacity = 1;
        });
    }, 1000);
};

// WebSocket connection to Triode Twitch DJ.
const ws = new WebSocket(SERVER);

// Ping the Triode Twitch DJ every 5 seconds.
setInterval(() => {
    const state = ws.readyState;
    if (state === 1) ws.send(JSON.stringify({event: 'ping'}));
}, 5000);

/**
 * Take in an IPC message from the main process and update the DOM.
 *
 * @param {IpcEvent} event IPC message from the main process
 */
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(`Got track info:`);
    console.log(data);

    // If the track title contains "[ID]" then don't show the track name
    // in the video.
    if (data.isId) {
        updateTrack({
            title: 'ID',
            artist: 'ID',
            albumArt: data.albumArt
        });
    } else {
        updateTrack({
            title: data.title,
            artist: data.artist,
            albumArt: data.albumArt
        });
    }
};
