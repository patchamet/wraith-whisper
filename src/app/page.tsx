import { Chat } from '@/components/Chat';

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-bold text-center mb-8">
        Real-time Chat
      </h1>
      <Chat />
    </main>
  );
}
