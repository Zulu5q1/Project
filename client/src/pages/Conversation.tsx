import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Message, Conversation as ConversationType } from "../types";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(price);
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  RESERVED: "Reserved",
  SOLD: "Sold",
  REMOVED: "Removed",
};

export default function Conversation() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ConversationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCount = useRef(0);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchData = useCallback(async () => {
    if (!conversationId) return;
    try {
      const [convRes, msgRes] = await Promise.all([
        apiFetch<{ conversation: ConversationType }>(`/api/conversations/${conversationId}`),
        apiFetch<{ messages: Message[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
          `/api/conversations/${conversationId}/messages?limit=100`
        ),
      ]);
      setConversation(convRes.conversation);
      setMessages(msgRes.messages);
      setError("");

      apiFetch(`/api/conversations/${conversationId}/read`, { method: "PATCH" }).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversation");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      scrollToBottom();
    }
    prevMessageCount.current = messages.length;
  }, [messages.length, scrollToBottom]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || !conversationId) return;

    setSending(true);
    try {
      const res = await apiFetch<{ message: Message }>(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      setMessages((prev) => [...prev, res.message]);
      setInput("");
      apiFetch(`/api/conversations/${conversationId}/read`, { method: "PATCH" }).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-16 bg-gray-200 rounded w-full" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`h-10 rounded-lg ${i % 2 === 0 ? "w-2/3 ml-auto bg-primary-100" : "w-2/3 mr-auto bg-gray-200"}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/messages" className="text-primary-600 hover:underline text-sm mb-4 inline-block">
          &larr; Back to Messages
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!conversation) return null;

  const other = conversation.seller.id === user?.id
    ? { firstName: conversation.buyer.firstName, lastName: conversation.buyer.lastName, username: conversation.buyer.username }
    : { firstName: conversation.seller.firstName, lastName: conversation.seller.lastName, username: conversation.seller.username };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-6rem)]">
      <Link to="/messages" className="text-primary-600 hover:underline text-sm mb-4 inline-block flex-shrink-0">
        &larr; Back to Messages
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg flex-shrink-0 p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
            {conversation.listing.images.length > 0 ? (
              <img src={conversation.listing.images[0]!.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div className="min-w-0">
            <Link
              to={`/listings/${conversation.listing.id}`}
              className="font-semibold text-gray-900 hover:text-primary-600 transition-colors truncate block"
            >
              {conversation.listing.title}
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-primary-600">{formatPrice(conversation.listing.price)}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                conversation.listing.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                conversation.listing.status === "SOLD" ? "bg-red-100 text-red-800" :
                conversation.listing.status === "RESERVED" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {STATUS_LABELS[conversation.listing.status]}
              </span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">Chatting with {other.firstName} {other.lastName}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm flex-shrink-0">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-2.5 rounded-2xl ${
                isMe
                  ? "bg-primary-600 text-white rounded-br-md"
                  : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
              }`}>
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? "text-primary-200" : "text-gray-400"}`}>
                  {timeAgo(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
