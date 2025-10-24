// This component shows hotel metadata, and offers some actions to the user like uploading a new hotel image, and adding a review.

import React from "react";
import renderStars from "@/src/components/Stars.jsx";

const HotelDetails = ({
  hotel,
  userId,
  handlehotelImage,
  setIsOpen,
  isOpen,
  children,
}) => {
  return (
    <section className="img__section">
      <img src={hotel.photo} alt={hotel.name} />

      <div className="actions">
        {userId && (
          <img
            alt="review"
            className="review"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            src="/review.svg"
          />
        )}
        <label
          onChange={(event) => handlehotelImage(event.target)}
          htmlFor="upload-image"
          className="add"
        >
          <input
            name=""
            type="file"
            id="upload-image"
            className="file-input hidden w-full h-full"
          />

          <img className="add-image" src="/add.svg" alt="Add image" />
        </label>
        <a href="http://www.freepik.com">Default Hotel Designed by Freepik</a>
      </div>

      <div className="details__container">
        <div className="details">
          <h2>{hotel.name}</h2>

          <div className="hotel__rating">
            <ul>{renderStars(hotel.avgRating)}</ul>

            <span>({hotel.numRatings})</span>
          </div>

          <p>
            {hotel.city}
          </p>
          <p>{"$".repeat(hotel.price)}</p>
          {children}
        </div>
      </div>
    </section>
  );
};

export default HotelDetails;
