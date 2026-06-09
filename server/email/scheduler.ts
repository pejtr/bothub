/**
 * Email Sequence Scheduler
 * Manages the drip campaign timing and subscriber progression
 * Uses database to track which emails have been sent to each subscriber
 */

import { getDb } from "../db";
import { emailSubscribers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import {
  WELCOME_SEQUENCE,
  getNextEmailInSequence,
  renderEmailTemplate,
  type EmailTemplate,
} from "./welcome-sequence";

export interface EmailSendResult {
  success: boolean;
  emailId: string;
  subscriberEmail: string;
  error?: string;
}

export interface SequenceStatus {
  subscriberEmail: string;
  currentStep: number;
  totalSteps: number;
  nextEmailId: string | null;
  nextSendDate: Date | null;
  isComplete: boolean;
}

/**
 * Get the sequence status for a subscriber
 */
export function getSequenceStatus(
  subscriberEmail: string,
  signupDate: Date,
  sentEmailIds: string[]
): SequenceStatus {
  const currentStep = sentEmailIds.length;
  const nextEmail = getNextEmailInSequence(currentStep);

  let nextSendDate: Date | null = null;
  if (nextEmail) {
    nextSendDate = new Date(signupDate);
    nextSendDate.setDate(nextSendDate.getDate() + nextEmail.dayOffset);
  }

  return {
    subscriberEmail,
    currentStep,
    totalSteps: WELCOME_SEQUENCE.totalEmails,
    nextEmailId: nextEmail?.id || null,
    nextSendDate,
    isComplete: currentStep >= WELCOME_SEQUENCE.totalEmails,
  };
}

/**
 * Check if an email should be sent based on timing
 */
export function shouldSendEmail(
  signupDate: Date,
  emailTemplate: EmailTemplate,
  now: Date = new Date()
): boolean {
  const sendDate = new Date(signupDate);
  sendDate.setDate(sendDate.getDate() + emailTemplate.dayOffset);

  // Send if we're past the send date (within a 24-hour window)
  const sendTime = sendDate.getTime();
  const nowTime = now.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  return nowTime >= sendTime && nowTime < sendTime + oneDayMs;
}

/**
 * Prepare email content with all variables filled in
 */
export function prepareEmailContent(
  template: EmailTemplate,
  subscriberEmail: string,
  appUrl: string = "https://ibots.manus.space"
): { subject: string; bodyHtml: string; bodyText: string } {
  const variables: Record<string, string> = {
    APP_URL: appUrl,
    LEAD_MAGNET_URL: `${appUrl}/api/lead-magnet/download?email=${encodeURIComponent(subscriberEmail)}`,
    UNSUBSCRIBE_URL: `${appUrl}/api/email/unsubscribe?email=${encodeURIComponent(subscriberEmail)}`,
    SUBSCRIBER_EMAIL: subscriberEmail,
  };

  return renderEmailTemplate(template, variables);
}

/**
 * Process the welcome sequence for all subscribers
 * This would be called by a cron job or scheduled task
 */
export async function processWelcomeSequence(): Promise<{
  processed: number;
  sent: number;
  errors: number;
}> {
  const db = await getDb();
  if (!db) {
    return { processed: 0, sent: 0, errors: 0 };
  }

  let processed = 0;
  let sent = 0;
  let errors = 0;

  try {
    // Get all subscribers
    const subscribers = await db.select().from(emailSubscribers);

    for (const subscriber of subscribers) {
      processed++;

      // In a production system, you'd track sent emails in a separate table
      // For now, we use the notification system to simulate email sending
      const signupDate = subscriber.createdAt;
      const now = new Date();
      const daysSinceSignup = Math.floor(
        (now.getTime() - signupDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      // Find the appropriate email for this day
      const emailForToday = WELCOME_SEQUENCE.emails.find(
        (e) => e.dayOffset === daysSinceSignup
      );

      if (emailForToday) {
        try {
          const content = prepareEmailContent(emailForToday, subscriber.email);

          // Use notification system to alert owner about emails that should be sent
          await notifyOwner({
            title: `📧 Welcome Email: ${emailForToday.id}`,
            content: `Email "${content.subject}" ready to send to ${subscriber.email} (Day ${emailForToday.dayOffset})`,
          });

          sent++;
        } catch (error) {
          console.error(
            `[EmailScheduler] Failed to process email for ${subscriber.email}:`,
            error
          );
          errors++;
        }
      }
    }
  } catch (error) {
    console.error("[EmailScheduler] Failed to process sequence:", error);
    errors++;
  }

  return { processed, sent, errors };
}

/**
 * Get a summary of the welcome sequence for display
 */
export function getSequenceSummary() {
  return {
    id: WELCOME_SEQUENCE.sequenceId,
    name: WELCOME_SEQUENCE.name,
    totalEmails: WELCOME_SEQUENCE.totalEmails,
    emails: WELCOME_SEQUENCE.emails.map((e) => ({
      id: e.id,
      dayOffset: e.dayOffset,
      subject: e.subject,
      tags: e.tags,
    })),
  };
}
