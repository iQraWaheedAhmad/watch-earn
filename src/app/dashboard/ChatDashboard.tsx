import { useState, useEffect, useRef } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { MessageSquare, Send, Users } from "lucide-react";

interface Message {
  id: string;
  text: string;
  timestamp: Timestamp;
  userId: string;
  isAdmin: boolean;
  replyTo?: string;
}

const ChatDashboard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, "id">),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !selectedUser) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        timestamp: Timestamp.now(),
        userId: "admin",
        isAdmin: true,
        replyTo: selectedUser,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] bg-gray-100 flex">
      {/* Sidebar - Active Users List */}
      <div className="w-1/4 bg-white p-4 shadow-md rounded-lg">
        <h2 className="font-semibold mb-4 text-lg">Active Conversations</h2>
        <div className="space-y-2">
          {Array.from(new Set(messages.map((msg) => msg.userId))).map(
            (userId, index) => (
              <button
                key={userId || `user-${index}`}
                onClick={() => setSelectedUser(userId)}
                className={`w-full p-3 text-left rounded-lg transition ${
                  selectedUser === userId
                    ? "bg-yellow-50 border border-yellow-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="ml-3">{userId || "Unknown User"}</span>
                </div>
              </button>
            )
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-3/4 p-6 flex flex-col">
        {selectedUser ? (
          <>
            <div className="flex items-center mb-4">
              <MessageSquare className="h-6 w-6 text-gray-600" />
              <h2 className="ml-2 text-lg font-semibold">
                Chat with {selectedUser}
              </h2>
            </div>

            {/* Messages Container */}
            <div className="flex-1 border rounded-lg p-4 overflow-y-auto bg-white shadow-sm h-96">
              {messages
                .filter(
                  (msg) => msg.userId === selectedUser || msg.replyTo === selectedUser
                )
                .map((msg, index) => (
                  <div
                    key={msg.id || `msg-${index}`}
                    className={`flex my-2 ${
                      msg.isAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Admin Sent Messages (Right Side, No Icon) */}
                    {msg.isAdmin && (
                      <div className="p-3 rounded-lg shadow-sm bg-yellow-300 max-w-xs">
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    )}

                    {/* User Received Messages (Left Side, No Icon) */}
                    {!msg.isAdmin && (
                      <div className="p-3 rounded-lg shadow-sm bg-gray-300 max-w-xs">
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="mt-4 flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="ml-3 bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-600 transition"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-500 flex justify-center items-center h-full">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDashboard; 