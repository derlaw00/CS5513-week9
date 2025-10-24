import {
  randomNumberBetween,
  getRandomDateAfter,
  getRandomDateBefore,
} from "@/src/lib/utils.js";
import { randomData } from "@/src/lib/randomData.js";

import { Timestamp } from "firebase/firestore";

export async function generateFakehotelsAndReviews() {
  const hotelsToAdd = 5;
  const data = [];

  for (let i = 0; i < hotelsToAdd; i++) {
    const hotelTimestamp = Timestamp.fromDate(getRandomDateBefore());

    const ratingsData = [];

    // Generate a random number of ratings/reviews for this hotel
    for (let j = 0; j < randomNumberBetween(0, 5); j++) {
      const ratingTimestamp = Timestamp.fromDate(
        getRandomDateAfter(hotelTimestamp.toDate())
      );

      const ratingData = {
        rating:
          randomData.hotelReviews[
            randomNumberBetween(0, randomData.hotelReviews.length - 1)
          ].rating,
        text: randomData.hotelReviews[
          randomNumberBetween(0, randomData.hotelReviews.length - 1)
        ].text,
        userId: `User #${randomNumberBetween()}`,
        timestamp: ratingTimestamp,
      };

      ratingsData.push(ratingData);
    }

    const avgRating = ratingsData.length
      ? ratingsData.reduce(
          (accumulator, currentValue) => accumulator + currentValue.rating,
          0
        ) / ratingsData.length
      : 0;

    const hotelData = {
      name: randomData.hotelNames[
        randomNumberBetween(0, randomData.hotelNames.length - 1)
      ],
      avgRating,
      city: randomData.hotelCities[
        randomNumberBetween(0, randomData.hotelCities.length - 1)
      ],
      numRatings: ratingsData.length,
      sumRating: ratingsData.reduce(
        (accumulator, currentValue) => accumulator + currentValue.rating,
        0
      ),
      price: randomNumberBetween(1, 4),
      photo: `/hotel.jpg`,
      timestamp: hotelTimestamp,
    };

    data.push({
      hotelData,
      ratingsData,
    });
  }
  return data;
}
