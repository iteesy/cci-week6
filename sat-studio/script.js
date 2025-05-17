const notes = ["E4", "D4", "C4", "A4", "G4"];
const highNotes = ["E5", "D5", "C5", "A5", "G5"];
const bassNotes = ["E2", "D2", "C2", "A2", "G2"];

// Main synth
const synth = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 1.2 }
}).toDestination();

// Higher octave synth
const highSynth = new Tone.Synth({
  oscillator: { type: "triangle" },
  envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 1.5 }
}).toDestination();

// Bass synth lower octave
const bassSynth = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 1.0 }
}).toDestination();

//effects
const effect1 = new Tone.PingPongDelay({
  delayTime: "4n",
  feedback: 0.2,
  wet: 0.5
}).toDestination();

// Connect all synths to effects
synth.connect(effect1);
highSynth.connect(effect1);
bassSynth.connect(effect1);

// Get video element
const video = document.getElementById('bg-video');
// Ensure video is paused initially
video.pause();

const btn = document.getElementById("sound-btn");
const highBtn = document.getElementById("high-btn");
const bassBtn = document.getElementById("bass-btn");
const glow = document.getElementById("glow");

// Set a slower tempo
Tone.Transport.bpm.value = 60;

// Create sequences for each synth
const sequence = new Tone.Sequence((time, i) => {
  const note = notes[i % notes.length];
  synth.triggerAttackRelease(note, "8n", time);
  glow.classList.add("active");
  setTimeout(() => {
    glow.classList.remove("active");
  }, 200);
}, [0, 1, 2, 3, 4, 0, 1, 2], "8n");

const highSequence = new Tone.Sequence((time, i) => {
  const note = highNotes[i % highNotes.length];
  highSynth.triggerAttackRelease(note, "8n", time);
}, [0, 1, 2, 3, 4, 0, 1, 2], "8n");

const bassSequence = new Tone.Sequence((time, i) => {
  const note = bassNotes[i % bassNotes.length];
  bassSynth.triggerAttackRelease(note, "8n", time);
}, [0, 1, 2, 3, 4, 0, 1, 2], "8n");

// Function to start/stop all sequences
function toggleSequences(start) {
  if (start) {
    sequence.start(0);
    highSequence.start(0);
    bassSequence.start(0);
  } else {
    sequence.stop();
    highSequence.stop();
    bassSequence.stop();
  }
}

// Main play button
btn.addEventListener("click", async () => {
  btn.disabled = true;
  await Tone.start();
  
  // Start video at half speed
  video.playbackRate = 0.5;
  video.play();
  
  // Reset and start main sequence
  sequence.stop();
  Tone.Transport.stop();
  Tone.Transport.position = 0;
  
  sequence.start(0);
  Tone.Transport.start();
  
  // Stop after one full sequence
  setTimeout(() => {
    sequence.stop();
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    btn.disabled = false;
    video.pause();
  }, 8000);
});

// High button
highBtn.addEventListener("click", async () => {
  await Tone.start();
  if (highSequence.state === "started") {
    highSequence.stop();
    highBtn.textContent = "high";
  } else {
    highSequence.start(0);
    highBtn.textContent = "high on";
  }
});

// Bass button
bassBtn.addEventListener("click", async () => {
  await Tone.start();
  if (bassSequence.state === "started") {
    bassSequence.stop();
    bassBtn.textContent = "bass";
  } else {
    bassSequence.start(0);
    bassBtn.textContent = "bass on";
  }
});

