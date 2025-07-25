let faceapiInstance = null;
let modelsLoaded = false;

export async function getFaceApi() {
  try {
    if (!faceapiInstance) {
      faceapiInstance = await import("face-api.js");
    }
    if (!modelsLoaded) {
      await Promise.all([
        faceapiInstance.nets.ssdMobilenetv1.loadFromUri(
          "/models/ssd_mobilenetv1"
        ),
        faceapiInstance.nets.faceLandmark68Net.loadFromUri(
          "/models/face_landmark_68"
        ),
      ]);
      modelsLoaded = true;
    }
    return faceapiInstance;
  } catch (error) {
    throw new Error(
      "Failed to load face-api.js models: " + (error?.message || error)
    );
  }
}
