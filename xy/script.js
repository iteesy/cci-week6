			
const buttonStart = document.getElementById("start-button");

function startTone() {
    buttonStart.disabled = "true"; //prevent multiple clicks
	Tone.start().then(() => { 
        console.log("audio is ready"); 
        buttonStart.style.display = "none";
    }).catch((error) => { 
        console.log("audio not ready"); 
        buttonStart.disabled = "false"; 
    });
}

const synth = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: { attack: 0.001, 
    decay: 0.1,
     sustain: 0.1, 
     release: 1.2 }
});

const effect1 = new Tone.PingPongDelay({
  delayTime: "4n",
  feedback: 0.2,
  wet: 0.5
}).toDestination();

// Connect synth to effect!!!!
synth.connect(effect1);
const sequence = new Tone.Sequence((time, note) => {
    synth.triggerAttackRelease(note, "2n", time);
}, ["E4", "D4", "C4", "A4", "G4"], "1n");
sequence.start(0);

const synthBass = new Tone.Synth().toDestination();

//const loop = new Tone.Loop((time) => {
//    synthBass.triggerAttackRelease("C0", "8n", time);
//}, "4n").start(0);


const reverb = new Tone.Reverb({
decay : 1.0,
preDelay : 0.01
}).toDestination();

// Add a gain node to control volume
const volumeGain = new Tone.Gain(1).toDestination();

// Create an LFO to control the volume
const volumeLFO = new Tone.LFO({
  type: "square",
  frequency: 1, // Slow oscillation
  min: 0,       // Fully silent
  max: 0.5,       // Full volume
  amplitude: 1, // Full-range modulation
}).start();

// Connect the LFO to the gain's volume
volumeLFO.connect(volumeGain.gain);

// Chain the effects
synth.chain(reverb, volumeGain);
synthBass.chain(volumeGain);

// Map values between a range
function map(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// HTML elements
const pad = document.getElementById('xy-pad');
const dot = document.getElementById('dot');

// Handle mouse events
pad.addEventListener('mousemove', (e) => {
    const rect = pad.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left, 0, rect.width);
    const y = clamp(e.clientY - rect.top, 0, rect.height);

    // Update dot position
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;

    const reverbDepth = map(x, 0, rect.width, 0, 0.5);
    const reverbFrequency = map(x, 0, rect.width, 0.1, 8);
    reverb.depth.value = reverbDepth;
    reverb.frequency.value = reverbFrequency;

    const lfoFrequency = map(y, 0, rect.height, 0.1, 15); // Slow to fast modulation
    volumeLFO.frequency.value = lfoFrequency;

    const lfoDepth = map(y, 0, rect.height, 0, 1); // None to full depth
    volumeLFO.amplitude.value = lfoDepth; // Apply depth directly to amplitude
});

// Play sound on mouse click
pad.addEventListener('mousedown', () => {
    //synth.triggerAttack("C4");
    Tone.getTransport().start(); // restart sequence
    dot.classList.add("active");
});

// Stop sound on mouse release
pad.addEventListener('mouseup', () => {
    //synth.triggerRelease();
    Tone.getTransport().pause(); // end sequence
    dot.classList.remove("active");
});