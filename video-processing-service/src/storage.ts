import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const storage = new Storage();

const rawVideoBucketName = "asif-yt-raw-videos";
const processedVideoBucketName = "asif-yt-processed-videos";

const localRawVideoPath = "/raw-video";
const localProcessedVideoPath = "/processed-videos";

/**
 * Creates the local directories for raw and processed videos.
 */

export function setUpDirectories() {
  ensureDirectoryExists(localRawVideoPath);
  ensureDirectoryExists(localProcessedVideoPath);
}

/**
 *  @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}
 *  @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}
 *  @returns A promise that resolves when the when the video has been converted.
 */

export function convertVideo(rawVideoName: string, processedVideoName: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
      .outputOptions("-vf", "scale=-1:360") // 360p
      .on("end", () => {
        console.log("Processing finished successfully");
        resolve();
      })
      .on("error", (err) => {
        console.error(`An error occured: ${err.message}`);
        reject(err);
      })
      .save(`${localProcessedVideoPath}/${processedVideoName}`);
  });
}

/**
 * @params fileName - The name of the video to upload from the
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}
 * @returns A promise that resolves when the video has been converted.
 */

export async function downloadRawVideo(fileName: string) {
  await storage
    .bucket(rawVideoBucketName)
    .file(fileName)
    .download({
      destination: `${localRawVideoPath}/${fileName}`,
    });

  console.log(`Downloaded ${fileName} to ${localRawVideoPath}/${fileName}`);
}

/**
 * @param fileName - The name of the file to download from the
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */

export async function uploadProcessedVideo(fileName: string) {
  const bucket = storage.bucket(processedVideoBucketName);

  await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
    destination: fileName,
  });

  console.log(
    `Uploaded ${fileName} to ${processedVideoBucketName} and made it public.`
  );

  await bucket.file(fileName).makePublic();
}

/**
 * @param fileName - The name of the file to upload from the
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */

export async function deleteRawVideo(fileName: string) {
  await deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 */

export async function deleteProcessedVideo(fileName: string) {
  await deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * @param fileName - The name of the file to delete from the
 * {@link localProcessedVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 *
 */

/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */

function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${filePath}: ${err.message}`);
          reject(err);
        } else {
          console.log(`Deleted file ${filePath}`);
          resolve();
        }
      });
    } else {
      console.log(`File ${filePath} does not exist, skipping deletion.`);
      resolve();
    }
  });
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
 */

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  } else {
    console.log(`Directory already exists: ${dirPath}`);
  }
}
