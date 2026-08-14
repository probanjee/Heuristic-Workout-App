import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const ask = trpc.assistant.ask.useMutation({
    onSuccess: answer =>
      setMessages(current => [
        ...current,
        { role: "assistant", content: answer },
      ]),
  });
  const send = (content: string) => {
    setMessages(current => [...current, { role: "user", content }]);
    ask.mutate({ question: content });
  };
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 pb-12 sm:p-8">
      <Button asChild variant="ghost" className="gap-2 text-muted-foreground">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
      </Button>
      <header>
        <Badge className="bg-primary/10 text-primary">
          <Sparkles className="mr-1 h-3 w-3" /> ENGINE COMPANION
        </Badge>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
          Adaptive assistant
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ask for form guidance or an explanation of today’s recommendation. The
          core engine remains the source of truth for workout selection.
        </p>
      </header>
      <AIChatBox
        messages={messages}
        onSendMessage={send}
        isLoading={ask.isPending}
        height="520px"
        emptyStateMessage="Ask about your current adaptive session"
        suggestedPrompts={[
          "Why was this workout selected?",
          "Give me form cues for the first exercise.",
          "How should I adjust if I feel pain?",
        ]}
        className="border-white/10 bg-card/70"
      />
    </div>
  );
}
