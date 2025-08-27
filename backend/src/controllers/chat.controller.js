const chatModel = require("../models/chat.model");

async function createChat(req, res) {
  const { title } = req.body;
  const user = req.user;

  const chat = await chatModel.create({
    user: user._id,
    title,
  });

  res.status(201).json({
    message: "Chat created successfully",
    chat: {
      _id: chat._id,
      title: chat._title,
      lastActivity: chat.lastActivity,
      user: chat.user,
    },
  });
}

async function getAllChats(req, res) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const chats = await chatModel
    .find({ user: user._id })
    .sort({ createdAt: -1 });
  res.status(200).json({
    message: "Chats fetched successfully",
    chats,
  });
}

module.exports = { createChat, getAllChats };
