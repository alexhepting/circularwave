document.addEventListener('DOMContentLoaded', function() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = document.getElementById('waveformCanvas');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY);

    let audioBuffer;
    let animationFrameId;
    const fileInfo = document.getElementById('fileInfo');
    const fileInput = document.getElementById('fileInput');

    function loadAudio(file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            audioContext.decodeAudioData(e.target.result, function(buffer) {
                audioBuffer = buffer;
                fileInfo.textContent = `File: ${file.name}`;
            });
        };

        reader.readAsArrayBuffer(file);
    }

    function drawWaveform(buffer) {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        source.start();

function draw() {
    analyser.getByteTimeDomainData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    let silent = true; // Flag to track if the waveform is silent

    for (let i = 0; i < bufferLength; i++) {
        const angle = (i / bufferLength) * Math.PI * 2;
        const amplitude = dataArray[i] / 128.0;

        const x = centerX + Math.cos(angle) * (radius * amplitude);
        const y = centerY + Math.sin(angle) * (radius * amplitude);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        if (amplitude > 0.02) {
            silent = false; // If there's a significant amplitude, it's not silent
        }
    }

    if (silent) {
        // If waveform is silent, draw a circle
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    } else {
        // Connect the last point back to the first point
        const angle = (bufferLength / bufferLength) * Math.PI * 2; // Use the last angle
        const amplitude = dataArray[bufferLength - 1] / 128.0; // Use the last amplitude
        const x = centerX + Math.cos(angle) * (radius * amplitude);
        const y = centerY + Math.sin(angle) * (radius * amplitude);
        ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.stroke();

    animationFrameId = requestAnimationFrame(draw);
}







function smoothAmplitude(dataArray, index) {
    const windowSize = 5; // Adjust this value for different levels of smoothing
    let sum = 0;

    for (let i = -windowSize; i <= windowSize; i++) {
        const newIndex = index + i;
        if (newIndex >= 0 && newIndex < dataArray.length) {
            sum += dataArray[newIndex] / 128.0;
        }
    }

    return sum / (2 * windowSize + 1);
}


        drawWaveform.bufferSource = source; 

        draw();
    }

    function stopDraw() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        if (drawWaveform.bufferSource) {
            drawWaveform.bufferSource.stop();
        }
    }

    fileInput.addEventListener('change', function() {
        const file = fileInput.files[0];
        if (file) {
            loadAudio(file);
        }
    });

    const playButton = document.getElementById('play');
    const pauseButton = document.getElementById('pause');
    const rewindButton = document.getElementById('rewind');

    playButton.addEventListener('click', function() {
        if (audioBuffer) {
            drawWaveform(audioBuffer);
        }
    });

    pauseButton.addEventListener('click', function() {
        audioContext.suspend();
        stopDraw();
    });

    rewindButton.addEventListener('click', function() {
        audioContext.resume();
        stopDraw();
    });
});
