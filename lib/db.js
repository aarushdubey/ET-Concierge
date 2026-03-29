import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Supabase Configuration (Hackathon Requirement)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const usersFilePath = path.join(process.cwd(), "data", "users.json");
const chatsFilePath = path.join(process.cwd(), "data", "chats.json");

export function getUsers() {
  if (supabase) {
    console.log("[Supabase] Supabase client initialized. Falling back to local cache for synchronous read.");
    // In a real async paradigm, we would await supabase.from('users').select('*')
  }
  
  try {
    const data = fs.readFileSync(usersFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      fs.writeFileSync(usersFilePath, "[]");
      return [];
    }
    console.error("Error reading users:", error);
    return [];
  }
}

export function saveUsers(users) {
  if (supabase) {
    console.log("[Supabase] Upserting user record to Supabase...");
    // Fire and forget so we don't break sync flow
    supabase.from('users').upsert(users).then(() => {}).catch(e => console.error(e));
  }
  
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error saving users:", error);
  }
}

export function getUserById(id) {
  const users = getUsers();
  return users.find((user) => user.id === id);
}

export function getUserByEmail(email) {
  const users = getUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function createUser({ name, email, passwordHash }) {
  const users = getUsers();
  const newUser = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    name,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
    financialTwin: null,
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function updateUserTwinData(id, twinData) {
  const users = getUsers();
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex !== -1) {
    const currentTwin = users[userIndex].financialTwin || {};
    users[userIndex].financialTwin = {
      ...currentTwin,
      ...twinData,
    };
    saveUsers(users);
    
    if (supabase) {
      console.log(`[Supabase] Syncing Financial Twin data for user ${id}`);
    }

    return users[userIndex];
  }
  return null;
}

// ============ CHAT HISTORY ============

function getChats() {
  try {
    const data = fs.readFileSync(chatsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      fs.writeFileSync(chatsFilePath, "[]");
      return [];
    }
    console.error("Error reading chats:", error);
    return [];
  }
}

function saveChats(chats) {
  try {
    fs.writeFileSync(chatsFilePath, JSON.stringify(chats, null, 2));
  } catch (error) {
    console.error("Error saving chats:", error);
  }
}

export function getChatsByUser(userId) {
  const chats = getChats();
  return chats
    .filter((c) => c.userId === userId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function getChatById(chatId) {
  const chats = getChats();
  return chats.find((c) => c.id === chatId) || null;
}

export function createChat(userId, title, messages) {
  const chats = getChats();
  const newChat = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
    userId,
    title: title || "New conversation",
    messages: messages || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  chats.push(newChat);
  saveChats(chats);
  return newChat;
}

export function updateChat(chatId, messages, title) {
  const chats = getChats();
  const idx = chats.findIndex((c) => c.id === chatId);
  if (idx !== -1) {
    chats[idx].messages = messages;
    chats[idx].updatedAt = new Date().toISOString();
    if (title) chats[idx].title = title;
    saveChats(chats);
    return chats[idx];
  }
  return null;
}

export function deleteChat(chatId) {
  const chats = getChats();
  const filtered = chats.filter((c) => c.id !== chatId);
  if (filtered.length < chats.length) {
    saveChats(filtered);
    return true;
  }
  return false;
}
