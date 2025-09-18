import express from "express";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import {
  convertVideo,
  deleteProcessedVideo,
  deleteRawVideo,
  downloadRawVideo,
  setUpDirectories,
  uploadProcessedVideo,
} from "./storage";
import { isVideoNew, setVideo } from "./firestore";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

setUpDirectories();

const app = express();
app.use(express.json());

app.post("/process-video", async (req, res) => {
  // Get the bucket and filename from the cloud Pub/Sub message
  let data;
  try {
    const message = Buffer.from(req.body.message.data, "base64").toString(
      "utf8"
    );
    data = JSON.parse(message);
    if (!data.name) {
      throw new Error("Invalid message payload recieved");
    }
  } catch (error) {
    console.error("Error parsing message data:", error);
    return res.status(400).send("Bad Request: missing filename");
  }

  const inputFileName = data.name; // Format of <UID>-<DATE>.<EXTENSION>
  const outputFileName = `processed-${inputFileName}`;
  const videoId = inputFileName.split(".")[0];

  if (!isVideoNew(videoId)) {
    return res.status(400).send('Bad Request: video already processed');
  } else {
    setVideo(videoId, { id: videoId, uid: inputFileName.split('-')[0], status: 'processing' });
  }

  // Download the raw video from Cloud storage
  await downloadRawVideo(inputFileName);

  // Convert the video to 360p
  try {
    await convertVideo(inputFileName, outputFileName);
  } catch (error) {
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName),
    ]);
    console.error("Error processing video:", error);
    return res.status(500).send("Error processing video");
  }

  // Upload the processed video to Cloud storage
  await uploadProcessedVideo(outputFileName);

  setVideo(videoId, {status: 'processed', filename: outputFileName});

  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName),
  ]);

  return res.status(200).send("Video processed successfully");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Video processing service listening at http://localhost:${port}`);
});
