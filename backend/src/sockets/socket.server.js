const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const {
  generateAIResponse,
  generateVectors,
} = require("../services/ai.service");
const messageModel = require("../models/message");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || ""); //cookies hoga to parse hoga nhi to error ayega qki string rhega tb parse hoga isliye nhi token h to khali string de diya "" or error khud se bhej diya
    // console.log("dat --->", cookies.token);
    if (!cookies.token) {
      // cookies parse hone ke baad string se ek object ban jayega usme token ayega nhi rhega to undefined
      next(new Error("Authentication error : No token provided"));
    }

    try {
      const token = cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      //   console.log(decoded);
      const user = await userModel.findOne({ _id: decoded.id });
      socket.user = user; //socket.user me daalenge cz req, res nhi hota socketIO me socket hota hai
      next();
    } catch (error) {
      next(new Error("Authentication error : No token provided"));
    }
  });

  io.on("connection", async (socket) => {
    socket.on("ai-message", async (messagePayload) => {
      // console.log(messagePayload);
      // messagePayload sample
      // messagePayload = {
      //   chat = 6532t6eggd8eh2edh2iyr
      //   content = "hello"
      // }


      //db me save kiya -> vector banaya -> query kiya (taki response achha de ske) -> vector database me save kiya (pinecone)
      //db me save kiya
      const message = await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id, //scket.user me user ko store krke rkh rhe hain socket middleware ke through
        content: messagePayload.content,
        role: "user",
      });

      //vector banaya
      const vectors = await generateVectors(messagePayload.content);

      //query kar liya
      const memory = await queryMemory({
        queryVector: vectors,
        limit: 3,
        metadata: {},
      });

      //pinecone me save kiya
      await createMemory({
        vectors,
        messageId: message._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: messagePayload.content,
        },
      });

      console.log(memory); //related result ayega us topic se


      //short term memory banaya - 20 recent chats tk
      const chatHistory = (
        await messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
      ).reverse();

      //gemini me stm bhejne ke format me change kiya (only role and parts)
      const stm = chatHistory.map((item) => {
        return {
          role: item.role,
          parts: [{ text: item.content }],
        };
      });

      const ltm = [
        {
          role: "user",
          parts: [
            {
              text: `
            these are some previous messages from the chat , use them to generate a response
            ${memory.map((item) => item.metadata.text).join("\n")}
            `,
            },
          ],
        },
      ];

      console.log(ltm[0]);
      console.log(stm);

      const response = await generateAIResponse([...ltm, ...stm]);

      //response = "ai reply"

      const responseMessage = await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      });

      const responseVectors = await generateVectors(response);

      await createMemory({
        vectors: responseVectors,
        messageId: responseMessage._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: response,
        },
      });

      socket.emit("ai-response", {
        chat: messagePayload.chat,
        content: response,
      });
    });
  });
}

module.exports = initSocketServer;
