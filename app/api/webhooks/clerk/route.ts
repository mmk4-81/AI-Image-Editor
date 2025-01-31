/* eslint-disable camelcase */
import { clerkClient, webhooks } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  let payload;
  try {
    // اعتبارسنجی Webhook جدید Clerk
    payload = await webhooks.verifySignature(req, {
      secret: WEBHOOK_SECRET,
    });
  } catch (error) {
    console.error("Error verifying webhook:", error);
    return new Response("Error verifying webhook", { status: 400 });
  }

  const eventType = payload.type;
  const { id, email_addresses, image_url, first_name, last_name, username } =
    payload.data;

  try {
    switch (eventType) {
      case "user.created":
        if (!email_addresses?.[0]?.email_address) {
          return NextResponse.json(
            { error: "Email is required" },
            { status: 400 }
          );
        }

        const newUser = await createUser({
          clerkId: id,
          email: email_addresses[0].email_address,
          username: username!,
          firstName: first_name,
          lastName: last_name,
          photo: image_url,
        });

        if (newUser) {
          await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: { userId: newUser._id },
          });
        }

        return NextResponse.json({ message: "User created", user: newUser });

      case "user.updated":
        const updatedUser = await updateUser(id, {
          firstName: first_name,
          lastName: last_name,
          username: username!,
          photo: image_url,
        });

        return NextResponse.json({
          message: "User updated",
          user: updatedUser,
        });

      case "user.deleted":
        if (!id) {
          return NextResponse.json(
            { error: "ID is required" },
            { status: 400 }
          );
        }

        const deletedUser = await deleteUser(id);
        return NextResponse.json({
          message: "User deleted",
          user: deletedUser,
        });

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
        return NextResponse.json({ message: "Event received" });
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
