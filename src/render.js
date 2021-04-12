const { remote } = require("electron");
const { Menu } = remote;

const videoElement = document.querySelector("video");
const audioElement = document.querySelector("audio");
const aspectRatioSelect = document.getElementById("aspectRatioSelect");
const videoSelectBtn = document.getElementById("videoSelect");
const audioSelectBtn = document.getElementById("audioSelect");

// Get the available video or audio sources
async function getSources(sourceType) {
  await navigator.mediaDevices.enumerateDevices().then((devices) => {
    const deviceSelectMenu = Menu.buildFromTemplate(
      devices
        .filter((device) => {
          if (sourceType === "audio") {
            return (
              device.kind === "audioinput" || device.kind === "audiooutput"
            );
          }

          if (sourceType === "video") {
            return (
              device.kind === "videoinput" || device.kind === "videooutput"
            );
          }
        })
        .map((device) => ({
          label: device.label,
          click: () =>
            selectSource(
              device,
              device.kind.includes("audio") ? "audio" : "video"
            ),
        }))
    );

    deviceSelectMenu.popup();
  });
}

// Change the source to preview.
async function selectSource(source, sourceType) {
  // Stop previous streams.
  if (window.stream) {
    window.stream.getTracks().forEach((track) => {
      console.log(track);
      track.stop();
    });
  }

  if (sourceType === "audio") audioSelectBtn.innerText = source.label;
  if (sourceType === "video") videoSelectBtn.innerText = source.label;

  let constraints = {};
  constraints[sourceType] = {
    deviceId: source.deviceId,
  };

  // Create a Stream for new source.
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  try {
    if (sourceType === "video") {
      videoElement.srcObject = stream;
      videoElement.play();
    }
    if (sourceType === "audio") {
      audioElement.srcObject = stream;
      audioElement.play();
    }
  } catch (e) {}
}

function changeAspectRatio(ratio) {
  let selection =
    aspectRatioSelect.options[aspectRatioSelect.selectedIndex].value;
  let currentRatio = videoElement.videoWidth / videoElement.videoHeight;
  let targetRatio = eval(selection.replace(":", "/"));
  let adjustmentRatio = targetRatio / currentRatio;
  videoElement.style.webkitTransform = `scaleX(${adjustmentRatio})`;
  videoElement.style.transform = `scaleX(${adjustmentRatio})`;
}
