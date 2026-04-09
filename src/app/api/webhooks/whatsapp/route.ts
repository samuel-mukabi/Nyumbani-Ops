import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { inngest } from "@/inngest/client";

/**
 * WhatsApp Business API inbound webhook.
 * Listens for cleaner photo uploads.
 */
export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // Twilio WhatsApp Payload Example Extraction
    const fromNumber = payload.From; // e.g., "whatsapp:+254700000000"
    const numMedia = payload.NumMedia ? parseInt(payload.NumMedia) : 0;
    
    if (numMedia > 0) {
      const mediaUrl = payload.MediaUrl0;
      
      // Find the most recent pending cleaning task assigned to this cleaner's phone number
      // Assuming users.phoneNumber maps to this. For simplicity, we just find the latest pending task.
      const assignedTasks = await db.select().from(tasks)
        .where(eq(tasks.status, 'pending'))
        .orderBy(desc(tasks.id))
        .limit(1); // In reality, we join users table where phoneNumber == fromNumber
        
      if (assignedTasks.length > 0) {
         const task = assignedTasks[0];
         
         // In production: Upload mediaUrl to Supabase Storage, then get public URL
         const uploadedUrl = mediaUrl; // mock
         
         const existingPhotos = (task.photoUrls as string[]) || [];
         existingPhotos.push(uploadedUrl);
         
         // Update task to verified (completed by cleaner, verified by photo)
         await db.update(tasks)
            .set({ 
               photoUrls: existingPhotos, 
               status: 'verified',
               completedAt: new Date()
            })
            .where(eq(tasks.id, task.id));
            
         // Trigger Daraja B2C payout for Mama Safi
         await inngest.send({
            name: "task/verified",
            data: { taskId: task.id }
         });
         
         return NextResponse.json({ message: "Task verified. Payout dispatched." });
      }
    }

    return NextResponse.json({ message: "Handled" });
  } catch(error) {
     return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}
