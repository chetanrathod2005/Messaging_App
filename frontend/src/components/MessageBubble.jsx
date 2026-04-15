import React, { useEffect, useState, useRef } from "react";
import { BsCheck2, BsCheck2All, BsPencil, BsTrash } from "react-icons/bs";
import { FiChevronDown } from "react-icons/fi";
import ReactionPicker from "./ReactionPicker.jsx";

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MediaContent = ({ msg, baseUrl }) => {
  if (!msg.mediaUrl) return null;
  const url = msg.mediaUrl.startsWith("http")
    ? msg.mediaUrl
    : `${baseUrl}${msg.mediaUrl}`;

  if (msg.mediaType === "image") {
    return (
      <a href={url} target="_blank" rel="noreferrer">
        <img
          src={url}
          alt="media"
          className="rounded-lg max-w-[240px] max-h-[200px] object-cover mb-1 cursor-pointer hover:opacity-90 transition"
        />
      </a>
    );
  }
  if (msg.mediaType === "audio") {
    return (
      <audio src={url} controls className="rounded-lg max-w-[240px] mb-1" />
    );
  }
  if (msg.mediaType === "video") {
    return (
      <video
        src={url}
        controls
        className="rounded-lg max-w-[240px] max-h-[200px] mb-1"
      />
    );
  }
  if (msg.mediaType === "file" || msg.mediaType === "document") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        download
        className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2 mb-1 text-sm hover:bg-black/30 transition"
      >
        <span className="text-xl">📄</span>
        <span className="truncate max-w-[160px]">
          {msg.mediaName || "Document"}
        </span>
      </a>
    );
  }
  return null;
};

const MessageBubble = ({
  msg,
  isMe,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
  onReact,
  authUser,
  baseUrl,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        (!buttonRef.current || !buttonRef.current.contains(e.target))
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [showReactions, setShowReactions] = useState(false);
  const holdTimer = useRef(null);

  const handlePointerDown = () => {
    holdTimer.current = setTimeout(() => {
      setShowReactions(true);
    }, 500);
  };
  const handlePointerUp = () => clearTimeout(holdTimer.current);

  if (msg.isDeletedForEveryone || msg.deletedForEveryone) {
    return (
      <div
        className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4 px-1`}
      >
        <div className="px-3  font-jetbrains py-2 rounded-xl text-xs text-[#8696a0] italic border border-[#2a3942] bg-transparent">
          🚫 This message was deleted
        </div>
      </div>
    );
  }


return (
  <div
    className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3 px-1`}
    onPointerDown={handlePointerDown}
    onPointerUp={handlePointerUp}
    onPointerLeave={handlePointerUp}
  >
    <div className="relative max-w-[72%] group">
      {showReactions && (
        <ReactionPicker
          onSelect={(emoji) => onReact(msg._id, emoji)}
          onClose={() => setShowReactions(false)}
        />
      )}

      <div
        className={`px-4 py-2.5 font-jetbrains  rounded-2xl text-[15px] leading-relaxed relative shadow-sm border ${
          isMe
            ? "bg-white text-[#111111] rounded-br-md border-[#d4d4d8]"
            : "bg-black text-white rounded-bl-md border-black"
        }`}
      >
        <MediaContent msg={msg} baseUrl={baseUrl} />

        {msg.message && (
          <p className="break-words font-jetbrains whitespace-pre-wrap pr-20 pb-5">
            {msg.message}
          </p>
        )}

        {(msg.isEdited || msg.edited) && (
          <div
            className={`text-xs font-jetbrains  italic mt-1 pr-20 pb-4 ${
              isMe ? "text-[#71717a]" : "text-[#d4d4d8]"
            }`}
          >
            edited
          </div>
        )}

        <span
          className={`absolute bottom-1.5 right-2.5 flex items-center gap-1 text-[11px] whitespace-nowrap ${
            isMe ? "text-[#71717a]" : "text-[#d4d4d8]"
          }`}
        >
          {formatTime(msg.createdAt)}
          {isMe &&
            (msg.seen ? (
              <BsCheck2All size={15} className="text-black" />
            ) : msg.delivered ? (
              <BsCheck2All size={15} className="text-[#71717a]" />
            ) : (
              <BsCheck2 size={15} className="text-[#71717a]" />
            ))}
        </span>

        {Array.isArray(msg.reactions) && msg.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 pt-1 pr-16">
            {Object.entries(
              msg.reactions.reduce((acc, r) => {
                if (!r?.emoji) return acc;
                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                return acc;
              }, {}),
            ).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReact(msg._id, emoji)}
                className={`rounded-full font-jetbrains px-2 py-0.5 text-xs flex items-center gap-0.5 transition border ${
                  isMe
                    ? "bg-[#f4f4f5] border-[#d4d4d8] hover:bg-[#e4e4e7] text-[#111111]"
                    : "bg-white text-black border-white hover:bg-[#f4f4f5]"
                }`}
              >
                {emoji} {count > 1 && <span>{count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className={`absolute ${isMe ? "left-0" : "right-0"} top-0 opacity-0 group-hover:opacity-100 transition z-10`}
      >
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu((v) => !v);
            setShowReactions(false);
          }}
          className="absolute top-1 right-1 z-50 w-7 h-7 rounded-full bg-white text-[#111111] shadow-md border border-[#e4e4e7] flex items-center justify-center hover:bg-[#f4f4f5] transition opacity-0 group-hover:opacity-100"
        >
          <FiChevronDown size={18} />
        </button>

        {showMenu && (
          <div
            ref={menuRef}
            className="absolute top-9 right-0 bg-white border border-[#d4d4d8] rounded-2xl shadow-2xl py-2 z-50 w-52 overflow-hidden"
            onClick={() => setShowMenu(false)}
          >
            <button
              onClick={() => setShowReactions(true)}
              className="flex items-center font-jetbrains gap-3 w-full text-[#111111] hover:bg-[#f4f4f5] px-4 py-3 text-[15px] font-medium transition"
            >
              😊 React
            </button>

            {isMe && !msg.mediaUrl && (
              <button
                onClick={() => onEdit(msg)}
                className="flex items-center font-jetbrains gap-3 w-full text-[#111111] px-4 py-3 text-[15px] font-medium hover:bg-[#f4f4f5] transition"
              >
                <BsPencil size={13} /> Edit message
              </button>
            )}

            <button
              onClick={() => onDeleteForMe(msg._id)}
              className="flex items-center font-jetbrains gap-3 w-full text-[#111111] px-4 py-3 text-[15px] font-medium hover:bg-[#f4f4f5] transition"
            >
              <BsTrash size={13} /> Delete for me
            </button>

            {isMe && (
              <button
                onClick={() => onDeleteForEveryone(msg._id)}
                className="flex items-center font-jetbrains gap-3 w-full px-4 py-3 text-[15px] font-medium text-red-600 hover:bg-red-50 transition"
              >
                <BsTrash size={13} /> Delete for everyone
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default MessageBubble;