//importing fake reviews function
import { generateFakehotelsAndReviews } from "@/src/lib/fakeHotels.js";

//importing functions needed to access/modify firebase 
import {
  collection,
  onSnapshot,
  query,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  orderBy,
  Timestamp,
  runTransaction,
  where,
  addDoc,
  getFirestore,
} from "firebase/firestore";

//importing database
import { db } from "@/src/lib/firebase/clientApp";

//function updates restruant image reference link
export async function updatehotelImageReference(
  hotelId,
  publicImageUrl
) {
  //grabbing the hotels id from firebase
  const hotelRef = doc(collection(db, "hotels"), hotelId);
  //checking if the hotels id was obtained 
  if (hotelRef) {
    //updating hotels photo to provided in firebase
    await updateDoc(hotelRef, { photo: publicImageUrl });
  }
}
//function updates the rating values and store a a review for new reviews
const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  //getting current hotel data from firestore
  const hotel = await transaction.get(docRef);
  //storing the hotel data into variable 
  const data = hotel.data();
  //checking if there's a new rating, if so + 1 to data.numRatings 
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
  //checking if a new sum needs to be calculated. if so adding new rating to all of current ratings
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);
  //calculating average of ratings 
  const newAverage = newSumRating / newNumRatings;
  //updating the hotel's ratings in firebase 
  transaction.update(docRef, {
    numRatings: newNumRatings,
    sumRating: newSumRating,
    avgRating: newAverage,
  });
  //creating new review 
  transaction.set(newRatingDocument, {
    ...review,
    timestamp: Timestamp.fromDate(new Date()),
  });
};
//function adds review to hotels
export async function addReviewTohotel(db, hotelId, review) {
  //error handling. Checking for if the hotel id was passed
        if (!hotelId) {
                throw new Error("No hotel ID has been provided.");
        }
  //error handling. Checking for if a review was passed
        if (!review) {
                throw new Error("A valid review has not been provided.");
        }

        try {
                //connecting to firebase and looking at current hotel
                const docRef = doc(collection(db, "hotels"), hotelId);
                //looking at current hotel's rating collection
                const newRatingDocument = doc(
                        collection(db, `hotels/${hotelId}/ratings`)
                );

                //updating the rating and storing the new review
                await runTransaction(db, transaction =>
                        updateWithRating(transaction, docRef, newRatingDocument, review)
                );
        } catch (error) {//checking for any errors
          //response to errors
                console.error(
                        "There was an error adding the rating to the hotel",
                        error
                );
                throw error;
        }
}
//function adds querys to the search when user adds query 
function applyQueryFilters(q, { city, price, sort }) {
  //checking which city
  if (city) {
    q = query(q, where("city", "==", city));
  }
  //checking price
  if (price) {
    q = query(q, where("price", "==", price.length));
  }
  //checking rating
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc"));
  } else if (sort === "Review") {
    q = query(q, orderBy("numRatings", "desc"));
  }
  //returning query
  return q;
}
//function gets hotels based on query
export async function gethotels(db = db, filters = {}) {
  //connecting to firebase and looking at hotels
  let q = query(collection(db, "hotels"));
  //looking for the specific queries the user selected
  q = applyQueryFilters(q, filters);
  //grabbing the data from firebase
  const results = await getDocs(q);
  //mapping the data from firebase
  return results.docs.map((doc) => {
    //returning the mapped data retrieved from firebase
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}
//function updates hotels whenever theres a change to hotels
export function gethotelsSnapshot(cb, filters = {}) {
  //error handling
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }
  //connecting to database
  let q = query(collection(db, "hotels"));
  //applying search queries 
  q = applyQueryFilters(q, filters);
  //sending data found
  return onSnapshot(q, (querySnapshot) => {
    //mapping data retrieved from firebase
    const results = querySnapshot.docs.map((doc) => {
      //returning mapped data
      return {
        id: doc.id,
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    //callback function to refresh
    cb(results);
  });
}
//function looks for hotels based off id
export async function gethotelById(db, hotelId) {
  //error handling checking if id provided is correct
  if (!hotelId) {
    console.log("Error: Invalid ID received: ", hotelId);
    return;
  }
  //connecting to database and retrieving hotel id
  const docRef = doc(db, "hotels", hotelId);
  //getting the hotel's above data
  const docSnap = await getDoc(docRef);
  //returning data found
  return {
    ...docSnap.data(),
    timestamp: docSnap.data().timestamp.toDate(),
  };
}
//function will look for hotels based off id but refresh when new hotel is added
export function gethotelSnapshotById(hotelId, cb) {
  return;
}
//function will get reviews for specified hotels
export async function getReviewsByhotelId(db, hotelId) {
  //error handling checking if a restraunt id was sent
  if (!hotelId) {
    console.log("Error: Invalid hotelId received: ", hotelId);
    return;
  }
//connecting to firebase and looking at specified hotel's ratings
  const q = query(
    collection(db, "hotels", hotelId, "ratings"),
    orderBy("timestamp", "desc")
  );
//grabbing the specified hotel's ratings
  const results = await getDocs(q);
  //mapping results
  return results.docs.map((doc) => {
    //returning what whas found
    return {
      id: doc.id,
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}
//function grabs a hotel's rating but updates whenever there's a new hotel added
export function getReviewsSnapshotByhotelId(hotelId, cb) {
  //checking if a hotel id was sent
  if (!hotelId) {
    console.log("Error: Invalid hotelId received: ", hotelId);
    return;
  }
//connecting to firebase and looking for the hotel's rating
  const q = query(
    collection(db, "hotels", hotelId, "ratings"),
    orderBy("timestamp", "desc")
  );
  //returning results whenever hotels are updated
  return onSnapshot(q, (querySnapshot) => {
    //mapping data sent from firebase
    const results = querySnapshot.docs.map((doc) => {
      //returning mapped data
      return {
        id: doc.id,
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    //callback function for when new hotels are added
    cb(results);
  });
}
//function adds fake hotels and reviews to firebase
export async function addFakehotelsAndReviews() {
  //generating fake hotels and reviews
  const data = await generateFakehotelsAndReviews();
  //iterating through and sending each one to firebase
  for (const { hotelData, ratingsData } of data) {
    try {
      //creating new hotel
      const docRef = await addDoc(
        collection(db, "hotels"),
        hotelData
      );
      //iterating through and adding all data for hotel just created
      for (const ratingData of ratingsData) {
        //adding all fake data into new hotel
        await addDoc(
          collection(db, "hotels", docRef.id, "ratings"),
          ratingData
        );
      }//checking for errors
    } catch (e) {
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
