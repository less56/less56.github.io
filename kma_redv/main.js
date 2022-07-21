const overlay = document.querySelector("#overlay");

const iframe = document.getElementById('iframe');

const tag = document.createElement('script');
// https://developers.google.com/youtube/iframe_api_reference?hl=ko
tag.src = 'https://www.youtube.com/iframe_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function showOverlay(bool) {
    overlay.style.visibility = bool ? 'visible' : 'hidden';
}
// showOverlay(false);

let timer;
let player;

let cntLowQuality = 0;

let lastLoadedFraction = null;
let cntLoadedFraction = 0;

// ###

function checkLoadedFraction() {
    let lf = player.getVideoLoadedFraction();
    let res = null;

    if (lastLoadedFraction == null) {
        lastLoadedFraction = lf;
        return res;
    }

    if (lastLoadedFraction == lf) {
        res = true;
    }

    lastLoadedFraction = lf;
    return res;
}

function checkRetry() {
    let r;
    setInterval(() => {
        r = checkLoadedFraction();
        if (r) {
            cntLoadedFraction++;
        } else {
            cntLoadedFraction = 0;
        }

        if (cntLoadedFraction >= 2) {
            pageReload();
        }
    }, 1000);
}

function pageReload() {
    window.location.reload();
}

function onPlayerStateChange(event) {
    switch (event.data) {
        case YT.PlayerState.UNSTARTED: // -1(시작되지 않음)
            console.log('-1(시작되지 않음)');
            return;
        case YT.PlayerState.ENDED: // 0(종료됨)
            console.log('0(종료됨)');
            pageReload();
            return;
        case YT.PlayerState.PLAYING: // 1(재생 중)
            console.log('1(재생 중)');
            showOverlay(false);
            return;
        case YT.PlayerState.PAUSED: // 2(일시중지됨)
            console.log('2(일시중지됨)');
            return;
        case YT.PlayerState.BUFFERING: // 3(버퍼링 중)
            console.log('3(버퍼링 중)');
            showOverlay(true);
            return;
        case YT.PlayerState.CUED: // 5(동영상 신호)
            console.log('5(동영상 신호)');
            return;
        default:
            return;
    }
}

function onReady(event) {
    checkRetry();

    event.target.setPlaybackQuality('hd1080');
    if (!window.obsstudio) {
        // NOTE: 일반 브라우저 환경은 mute되지 않은 상태에 자동재생 강제 비활성됨 (자동 재생 정책 참고)
        event.target.setVolume(0);
    }

    console.log('onReady', event);
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('iframe', {
        events: {
            'onReady': onReady,
            'onStateChange': onPlayerStateChange
        }
    });
}