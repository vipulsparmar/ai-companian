import React, { Suspense } from "react";
import { TranscriptProvider } from "@/app/contexts/TranscriptContext";
import { EventProvider } from "@/app/contexts/EventContext";
import SimpleApp from "./SimpleApp";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TranscriptProvider>
        <EventProvider>
          <SimpleApp />
        </EventProvider>
      </TranscriptProvider>
    </Suspense>
  );
}
