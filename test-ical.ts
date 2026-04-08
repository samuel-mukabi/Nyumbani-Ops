import { syncPropertyIcal } from "./src/lib/ical";
import { db } from "./src/db";
import { properties } from "./src/db/schema";

async function test() {
  console.log("Starting iCal sync test...");
  
  // We need a property in the DB to test with.
  // Since I don't want to mess up the DB, I'll just check if one exists.
  const prop = await db.query.properties.findFirst();
  
  if (!prop) {
    console.log("No property found in DB. Please create one to test.");
    return;
  }

  const mockUrl = "https://www.airbnb.com/calendar/ical/12345.ics?s=67890"; // This won't work without a real URL
  console.log(`Testing with property: ${prop.name} (${prop.id})`);
  
  try {
    // Note: This will likely fail with 404 or similar if the URL is fake, 
    // but we can at least see if the fetch-and-parse logic kicks in.
    const results = await syncPropertyIcal(prop.id, mockUrl);
    console.log("Sync Results:", results);
  } catch (e) {
    console.log("Expected error for mock URL:", (e as Error).message);
  }
}

test();
