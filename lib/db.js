import fs from "fs";
import path from "path";

const usersFilePath = path.join(process.cwd(), "data", "users.json");

export function getUsers() {
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
    financialTwin: null, // Will be populated from the chat
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function updateUserTwinData(id, twinData) {
  const users = getUsers();
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex !== -1) {
    // recursively merge financial twin
    const currentTwin = users[userIndex].financialTwin || {};
    users[userIndex].financialTwin = {
      ...currentTwin,
      ...twinData,
    };
    saveUsers(users);
    return users[userIndex];
  }
  return null;
}
