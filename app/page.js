import HomeComponent from "@/components/HomeComponent";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense>
      <HomeComponent />
    </Suspense>
  )
}