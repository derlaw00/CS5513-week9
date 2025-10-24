"use client";

// This components handles the hotel listings page
// It receives data from src/app/page.jsx, such as the initial hotels and search params from the URL

import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import renderStars from "@/src/components/Stars.jsx";
import { gethotelsSnapshot } from "@/src/lib/firebase/firestore.js";
import Filters from "@/src/components/Filters.jsx";

const HotelItem = ({ hotel }) => (
  <li key={hotel.id}>
    <Link href={`/hotel/${hotel.id}`}>
      <ActiveHotel hotel={hotel} />
    </Link>
  </li>
);

const ActiveHotel = ({ hotel }) => (
  <div>
    <ImageCover photo={hotel.photo} name={hotel.name} />
    <HotelDetails hotel={hotel} />
  </div>
);

const ImageCover = ({ photo, name }) => (
  <div className="image-cover">
    <img src={photo} alt={name} />
  </div>
);

const HotelDetails = ({ hotel }) => (
  <div className="hotel__details">
    <h2>{hotel.name}</h2>
    <HotelRating hotel={hotel} />
    <HotelMetadata hotel={hotel} />
  </div>
);

const HotelRating = ({ hotel }) => (
  <div className="hotel__rating">
    <ul>{renderStars(hotel.avgRating)}</ul>
    <span>({hotel.numRatings})</span>
  </div>
);

const HotelMetadata = ({ hotel }) => (
  <div className="hotel__meta">
    <p>
      {hotel.category} | {hotel.city}
    </p>
    <p>{"$".repeat(hotel.price)}</p>
  </div>
);

export default function HotelListings({
  initialhotels,
  searchParams,
}) {
  const router = useRouter();

  // The initial filters are the search params from the URL, useful for when the user refreshes the page
  const initialFilters = {
    city: searchParams.city || "",
    price: searchParams.price || "",
    sort: searchParams.sort || "",
  };

  const [hotels, sethotels] = useState(initialhotels);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    routerWithFilters(router, filters);
  }, [router, filters]);

  useEffect(() => {
    return gethotelsSnapshot((data) => {
      sethotels(data);
    }, filters);
  }, [filters]);

  return (
    <article>
      <Filters filters={filters} setFilters={setFilters} />
      <ul className="hotels">
        {hotels.map((hotel) => (
          <HotelItem key={hotel.id} hotel={hotel} />
        ))}
      </ul>
    </article>
  );
}

function routerWithFilters(router, filters) {
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  }

  const queryString = queryParams.toString();
  router.push(`?${queryString}`);
}
