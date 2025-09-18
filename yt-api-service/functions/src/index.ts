import {beforeUserCreated} from "firebase-functions/v2/identity";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";
import * as functions from "firebase-functions";

initializeApp();

functions.setGlobalOptions({region: "asia-south1"});

const firestore = new Firestore();
const storage = new Storage();

const rawVideoBucketName = "asif-yt-raw-videos";

const videoCollectionId = "videos";

export interface Video {
  id?: string,
  uid?: string,
  filename?: string,
  status?: "processing" | "processed",
  title?: string,
  description?: string
}

export const createUser = beforeUserCreated(
  {region: "asia-south1"}, (UserRecord) => {
    const userInfo = {
      uid: UserRecord.data!.uid,
      email: UserRecord.data!.email,
      // photoUrl: UserRecord.data!.photoURL,
    };

    firestore.collection("users").doc(UserRecord.data!.uid).set(userInfo);
    logger.info(`User Created: ${JSON.stringify(userInfo)}`);
    return;
  });

export const generateUploadUrl = onCall({maxInstances: 1}, async (request) => {
  // Check if the user is authentication
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  const auth = request.auth;
  const data = request.data;
  const bucket = storage.bucket(rawVideoBucketName);

  // Generate a unique filename for upload
  const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;

  // Get a v4 signed URL for uploading file
  const [url] = await bucket.file(fileName).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  return {url, fileName};
});

export const getVideos = onCall({maxInstances: 1}, async () => {
  const querySnapshot =
    await firestore.collection(videoCollectionId).limit(10).get();
  return querySnapshot.docs.map((doc) => doc.data());
});
