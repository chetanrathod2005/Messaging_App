import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  emoji: { type: String, required: true },
});

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: { type: String, default: "" },

    // Media
    mediaUrl: { type: String, default: "" },
    mediaType: {
      type: String,
      enum: ["image", "video", "audio", "file", ""],
      default: "",
    },
    mediaName: { type: String, default: "" },

    // E2E encryption: store ciphertext per recipient
    encryptedContent: {
      senderCipher: { type: String, default: "" },
      receiverCipher: { type: String, default: "" },
      iv: { type: String, default: "" },
    },

    // Edit/delete
    isEdited: { type: Boolean, default: false },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isDeletedForEveryone: { type: Boolean, default: false },

    // Reactions
    reactions: [reactionSchema],

    // Delivery status
    // status: {
    //   type: String,
    //   enum: ["sent", "delivered", "read"],
    //   default: "sent",
    // },

delivered: {
  type: Boolean,
  default: false,
},
seen: {
  type: Boolean,
  default: false,
},
seenAt: {
  type: Date,
  default: null,
},

  },
  { timestamps: true },
);

export const Message = mongoose.model("Message", messageSchema);
