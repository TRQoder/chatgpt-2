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

      /*
      //db me save kiya
      const message = await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id, //scket.user me user ko store krke rkh rhe hain socket middleware ke through
        content: messagePayload.content,
        role: "user",
      });

      //vector banaya
      const vectors = await generateVectors(messagePayload.content);
*/

      // 1 & 2: save + vector generation parallel
      const [message, vectors] = await Promise.all([
        messageModel.create({
          chat: messagePayload.chat,
          user: socket.user._id, //scket.user me user ko store krke rkh rhe hain socket middleware ke through
          content: messagePayload.content,
          role: "user",
        }),
        generateVectors(messagePayload.content),
      ]);

      /*
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
*/


      // 3 & 4: query memory + save vectors parallel
      const [memory] = await Promise.all([
        queryMemory({
          queryVector: vectors,
          limit: 3,
          metadata: {},
        }),
        createMemory({
          vectors,
          messageId: message._id,
          metadata: {
            chat: messagePayload.chat,
            user: socket.user._id,
            text: messagePayload.content,
          },
        }),
      ]);

      console.log(memory); //related result ayega us topic se

      //5: get chat history - 20 recent chats tk 
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

      //6: reply aa gya to pehle emit krdo bdd me save krenge
      socket.emit("ai-response", {
        chat: messagePayload.chat,
        content: response,
      });

      /*      const responseMessage = await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      });

      const responseVectors = await generateVectors(response);
*/
      // 7 & 8: save AI response + generate its vectors in parallel (responseMessage + responseVector)

      const [responseMessage, responseVectors] = await Promise.all([
        messageModel.create({
          chat: messagePayload.chat,
          user: socket.user._id,
          content: response,
          role: "model",
        }),
        generateVectors(response),
      ]);

      // 9 : save response vector
      await createMemory({
        vectors: responseVectors,
        messageId: responseMessage._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: response,
        },
      });
    });
  });
}

module.exports = initSocketServer;
