import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { api } from "~/trpc/server";
import { env } from "~/envServer";

interface EmailVerification {
  status: string;
  strategy: string;
}

interface EmailAddress {
  email_address: string;
  id: string;
  linked_to: [];
  object: string;
  verification: EmailVerification;
  created_at: number;
  updated_at: number;
}

interface ClerkWebhookPayload {
  data: {
    birthday: string;
    created_at: number;
    email_addresses: EmailAddress[];
    external_accounts: [];
    external_id: string;
    first_name: string;
    gender: string;
    id: string;
    image_url: string;
    last_name: string;
    last_sign_in_at: number;
    object: string;
    password_enabled: boolean;
    phone_numbers: [];
    primary_email_address_id: string | null;
    primary_phone_number_id: string | null;
    primary_web3_wallet_id: string | null;
    private_metadata: Record<string, unknown>;
    profile_image_url: string;
    public_metadata: Record<string, unknown>;
    two_factor_enabled: boolean;
    unsafe_metadata: Record<string, unknown>;
    updated_at: number;
    username: string | null;
    web3_wallets: [];
  };
  instance_id: string;
  object: string;
  timestamp: number;
  type: "user.created" | "user.updated" | "user.deleted";
}

export async function POST(req: Request) {
  const SIGNING_SECRET = env.CLERK_SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const payload: ClerkWebhookPayload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Send user data to vercel db
  const { id } = evt.data;
  if (!id) {
    throw new Error("Error: Missing user ID in webhook event data");
  }
  const eventType = evt.type;
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`);

  if (evt.type === "user.created") {
    const {
      first_name,
      last_name,
      email_addresses,
      primary_email_address_id,
      image_url,
    } = payload.data;

    const emailObj = email_addresses.find(
      (email) => email.id === primary_email_address_id,
    );
    const name = `${first_name} ${last_name}`;

    let emailVerifiedDate: Date | undefined = undefined;
    let email = undefined;
    if (emailObj && emailObj.verification.status === "verified") {
      emailVerifiedDate = new Date(emailObj.updated_at);
      email = emailObj.email_address;
    }

    const user = await api.user.createUser({
      id,
      name,
      email: email ?? "",
      emailVerified: emailVerifiedDate,
      image: image_url,
    });

    console.log("userId created:", user.id);
  }

  // fix this up later!!
  if (evt.type === "user.updated") {
    console.log("userId updated:", evt.data.id);
  }

  // Delete user from vercel db
  if (evt.type === "user.deleted") {
    await api.user.deleteUser({ id });
    console.log("userId deleted:", evt.data.id);
  }

  return new Response("Webhook received", { status: 200 });
}
