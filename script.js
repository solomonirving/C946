const imageUpload = document.getElementById("imageUpload");
const personLabel = document.getElementById("personLabel");
const button = document.getElementById("button");

let results;
let item;

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
]).then(initAI);

//Initiate Facial Recognition Function
async function initAI() {
  const labeledFaceDescriptors = await loadLabeledImages();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
  let image;

  imageUpload.addEventListener("change", async () => {
    imageUpload.disabled = true;

    if (image) image.remove();
    image = await faceapi.bufferToImage(imageUpload.files[0]);

    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();

    results = detections.map((d) => faceMatcher.findBestMatch(d.descriptor));

    //if the results are "unknown" throw danger alert
    if(results[0]._label === "unknown") {
      console.log(results)
      item = document.createTextNode(
        "Proceed With Caution: Person Not Recognized"
      );
      personLabel.appendChild(item);
      $("#personLabel").removeClass("d-none");
      $("#personLabel").removeClass("alert-success").addClass("alert-danger");
      return
    }

    //if the results are found or not found
    if (results[0]._distance > 0.5) {      
      item = document.createTextNode(results[0].label + " is approved");
      personLabel.appendChild(item);
      $("#personLabel").removeClass("d-none");
      $("#personLabel").removeClass("alert-danger").addClass("alert-success");
    } else {
      item = document.createTextNode(
        "Proceed With Caution: Person Not Recognized"
      );
      personLabel.appendChild(item);
      $("#personLabel").removeClass("d-none");
      $("#personLabel").removeClass("alert-success").addClass("alert-danger");
    }
  });
}

//Match Label to Stored Image
function loadLabeledImages() {
  const labels = [
    "Angelina Jolie",
    "Denzel Washington",
    "Jennifer Lawrence",
    "Robert Downey Jr",
    "Will Smith"
  ];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 20; i++) {
        const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/solomonirving/C946/main/cleanedImages/${label}/${i}.jpg`);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }

      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

//Reset Button Handler
$("#button").click(function () {
  personLabel.removeChild(item);
  $("#personLabel").addClass("d-none");
  imageUpload.disabled = false;
});