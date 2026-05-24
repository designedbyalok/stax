import { google } from "googleapis";
import { getGoogleOAuthClient } from "./calendar-auth";
import { decrypt } from "@/lib/crypto/encrypt";
import prisma from "@/lib/db";

type CreateEventArgs = {
  userId: string;
  applicationId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
  addMeet?: boolean;
};

export async function createGoogleCalendarEvent(args: CreateEventArgs) {
  const integration = await prisma.googleIntegration.findUnique({
    where: { userId: args.userId },
  });

  if (!integration) {
    throw new Error("Google Calendar not connected");
  }

  // Decrypt refresh token
  const refreshToken = decrypt(
    integration.encryptedToken,
    integration.iv
  );

  const oauth2Client = getGoogleOAuthClient();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const eventRequestBody: any = {
    summary: args.title,
    description: args.notes,
    start: {
      dateTime: args.startTime.toISOString(),
    },
    end: {
      dateTime: args.endTime.toISOString(),
    },
  };

  if (args.addMeet) {
    eventRequestBody.conferenceData = {
      createRequest: {
        requestId: Math.random().toString(36).substring(7),
        conferenceSolutionKey: {
          type: "hangoutsMeet",
        },
      },
    };
  }

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: eventRequestBody,
    conferenceDataVersion: args.addMeet ? 1 : 0,
  });

  if (!response.data.id) {
    throw new Error("Failed to create Google Calendar event");
  }

  // Save to DB
  const calendarEvent = await prisma.calendarEvent.create({
    data: {
      userId: args.userId,
      applicationId: args.applicationId,
      googleEventId: response.data.id,
      title: args.title,
      startTime: args.startTime,
      endTime: args.endTime,
      meetLink: response.data.hangoutLink,
      notes: args.notes,
    },
  });

  return calendarEvent;
}
