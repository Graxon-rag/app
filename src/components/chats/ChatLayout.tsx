import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

export default function ChatLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
}
