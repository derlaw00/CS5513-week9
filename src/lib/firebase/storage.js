//importing ref uploadBytesResumable and getDownloadURL from firebase
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
//importing storage from clientapp
import { storage } from "@/src/lib/firebase/clientApp";
//importing updatehotelImageReference from firestore.js
import { updatehotelImageReference } from "@/src/lib/firebase/firestore";
//function will update hotel image
export async function updatehotelImage(hotelId, image) {
  try {//handling for if no hotel ID was sent
    if (!hotelId) {
      throw new Error("No hotel ID has been provided.");
    }
//error handling for if no image was sent
    if (!image || !image.name) {
      throw new Error("A valid image has not been provided.");
    }
    //getting new image URL and uploading to firebase
    const publicImageUrl = await uploadImage(hotelId, image);
    //sending new image URL to updatehotelImageReference for it to update the url
    await updatehotelImageReference(hotelId, publicImageUrl);
//returning the new url
    return publicImageUrl;
  } catch (error) {//displaying error if error
    console.error("Error processing request:", error);
  }
}
//function will upload image from user
async function uploadImage(hotelId, image) {
  //creating new filepath for firebase
  const filePath = `images/${hotelId}/${image.name}`;
  //storing new url just created into variable for later
  const newImageRef = ref(storage, filePath);
  //sending image user uploaded to the new url
  await uploadBytesResumable(newImageRef, image);
//sending new image url to rest of project
  return await getDownloadURL(newImageRef);
}