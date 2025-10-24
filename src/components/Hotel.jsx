"use client";
//telling NextJS this is a client component in the app

// This components shows one individual hotel
// It receives data from src/app/hotel/[id]/page.jsx
//importing react, useState, useEffect, Suspense from React
import { React, useState, useEffect, Suspense } from "react";
//importing dynamic from nextjs
import dynamic from "next/dynamic";
//importing gethotelSnapshotById from firestore.js
import { gethotelSnapshotById } from "@/src/lib/firebase/firestore.js";
//importing getUser from getUser.js
import { useUser } from "@/src/lib/getUser";
//importing HotelDetails from HotelDetails.jsx
import HotelDetails from "@/src/components/HotelDetails.jsx";
//importing updatehotelImage from storage.js
import { updatehotelImage } from "@/src/lib/firebase/storage.js";
//storing ReviewDialog DOM component using dynamic from nextjs
const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));
//function is creating the Restraunt DOM component
export default function Hotel({
  id,
  initialhotel,
  initialUserId,
  children,
}) {
  //using useState from react to update hotel details in real time
  const [hotelDetails, setHotelDetails] = useState(initialhotel);
  //using useState from react to update isOpen in real time
  const [isOpen, setIsOpen] = useState(false);

  // The only reason this component needs to know the user ID is to associate a review with the user, and to know whether to show the review dialog
  const userId = useUser()?.uid || initialUserId;//checking if a user is logged in or else shove in default user
  //using useState from react to update the review when the reviews are updated
  const [review, setReview] = useState({
    rating: 0,
    text: "",
  });
//function will insert the reviews on change
  const onChange = (value, name) => {
    //setting the review and name of user who put review
    setReview({ ...review, [name]: value });
  };
//function will check for new hotels images users have uploaded
  async function handlehotelImage(target) {
    //checking if a new image was sent
    const image = target.files ? target.files[0] : null;
    //if no image leave function
    if (!image) {
      return;
    }
//getting new image url path by calling updatehotelImage and sending the hotel ID and new image
    const imageURL = await updatehotelImage(id, image);
    //calling setHotelDetails that was created earlier with useState and sending restrautDetails and new photo
    setHotelDetails({ ...hotelDetails, photo: imageURL });
  }
//function will handle closing of forms 
  const handleClose = () => {
    //setting isOpen to fall
    setIsOpen(false);
    //senting user's review with default values if not filled
    setReview({ rating: 0, text: "" });
  };
//checking for when a changed has been made
  useEffect(() => {
    //returning the new data to update the page on since this is client side
    return gethotelSnapshotById(id, (data) => {
      setHotelDetails(data);
    });
  }, [id]);

  return (
    <>
      <HotelDetails
        hotel={hotelDetails}
        userId={userId}
        handlehotelImage={handlehotelImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {children}
      </HotelDetails>
      {userId && (
        <Suspense fallback={<p>Loading...</p>}>
          <ReviewDialog
            isOpen={isOpen}
            handleClose={handleClose}
            review={review}
            onChange={onChange}
            userId={userId}
            id={id}
          />
        </Suspense>
      )}
    </>
  );
}
