import Hotel from "@/src/components/Hotel.jsx";
import { Suspense } from "react";
import { gethotelById } from "@/src/lib/firebase/firestore.js";
import {
  getAuthenticatedAppForUser,
  getAuthenticatedAppForUser as getUser,
} from "@/src/lib/firebase/serverApp.js";
import ReviewsList, {
  ReviewsListSkeleton,
} from "@/src/components/Reviews/ReviewsList";
import {
  GeminiSummary,
  GeminiSummarySkeleton,
} from "@/src/components/Reviews/ReviewSummary";
import { getFirestore } from "firebase/firestore";

export default async function Home(props) {
  // This is a server component, we can access URL
  // parameters via Next.js and download the data
  // we need for this page
  const params = await props.params;
  const { currentUser } = await getUser();
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const hotel = await gethotelById(
    getFirestore(firebaseServerApp),
    params.id
  );

  return (
    <main className="main__hotel">
      <Hotel
        id={params.id}
        initialhotel={hotel}
        initialUserId={currentUser?.uid || ""}
      >
        <Suspense fallback={<GeminiSummarySkeleton />}>
          <GeminiSummary hotelId={params.id} />
        </Suspense>
      </Hotel>
      <Suspense
        fallback={<ReviewsListSkeleton numReviews={hotel.numRatings} />}
      >
        <ReviewsList hotelId={params.id} userId={currentUser?.uid || ""} />
      </Suspense>
    </main>
  );
}
