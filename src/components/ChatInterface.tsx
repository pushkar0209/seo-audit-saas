"use client"

import { useChat } from '@ai-sdk/react';
import { useRef, useEffect } from 'react';

export function ChatInterface() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { messages, input, handleInputChange, handleSubmit, isLoading } = (useChat as any)({
        api: '/api/chat',
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-white relative">
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.length === 0 ? (
                    <div className="text-gray-400 text-sm text-center mt-10 italic">
                        Ask any question about standard SEO practices...
                    </div>
                ) : (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    messages.map((m: any) => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${m.role === 'user'
                                    ? 'bg-black text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                                    }`}
                            >
                                {m.content}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="border-t p-3 bg-gray-50 flex items-center shrink-0">
                <form onSubmit={handleSubmit} className="w-full flex gap-2">
                    <input
                        className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black shadow-inner"
                        value={input}
                        placeholder="E.g., How do I fix missing H1 tags?"
                        onChange={handleInputChange}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-black text-white px-4 py-2 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm"
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
