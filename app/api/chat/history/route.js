import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getChatsByUser, getChatById, createChat, updateChat, deleteChat } from "@/lib/db";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("id");

    if (chatId) {
      const chat = getChatById(chatId);
      if (!chat || chat.userId !== sessionId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ chat });
    }

    const chats = getChatsByUser(sessionId);
    const summaries = chats.map((c) => ({
      id: c.id,
      title: c.title,
      messageCount: c.messages.length,
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({ chats: summaries });
  } catch (error) {
    console.error("History GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, messages, title } = await request.json();

    if (chatId) {
      const existing = getChatById(chatId);
      if (!existing || existing.userId !== sessionId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const updated = updateChat(chatId, messages, title);
      return NextResponse.json({ chat: { id: updated.id, title: updated.title } });
    }

    const newChat = createChat(sessionId, title || generateTitle(messages), messages);
    return NextResponse.json({ chat: { id: newChat.id, title: newChat.title } });
  } catch (error) {
    console.error("History POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;
    if (!sessionId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get("id");
    if (!chatId) {
      return NextResponse.json({ error: "Missing chat ID" }, { status: 400 });
    }

    const existing = getChatById(chatId);
    if (!existing || existing.userId !== sessionId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    deleteChat(chatId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("History DELETE error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function generateTitle(messages) {
  if (!messages || messages.length === 0) return "New conversation";
  const firstUser = messages.find((m) => m.role === "user");
  if (firstUser) {
    const text = firstUser.content.trim();
    return text.length > 50 ? text.substring(0, 47) + "..." : text;
  }
  return "New conversation";
}
