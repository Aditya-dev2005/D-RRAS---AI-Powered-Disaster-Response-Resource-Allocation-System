"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bot, FileText, Flame, Loader2, Send, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DisasterStatusBadge } from "@/components/shared/disaster-status-badge";
import { SeverityIndicator } from "@/components/shared/severity-indicator";
import { EmptyState } from "@/components/shared/empty-state";
import { useGenerateSummary, useAskAssistant } from "@/hooks/use-ai";
import { useDisasters } from "@/hooks/use-disasters";
import { getApiErrorMessage } from "@/lib/api-client";

interface ChatMessage { role: "user" | "assistant"; content: string; }

const EXAMPLE_QUESTIONS = [
  "Which city needs resources most urgently right now?",
  "Which disaster has the highest severity?",
  "Which road blocks are currently affecting response time?",
  "How many volunteers are available in Chennai?",
];

export default function AIPage() {
  const { data: disasters } = useDisasters();
  const [selectedDisasterId, setSelectedDisasterId] = useState<string>("");
  const [summary, setSummary] = useState<string | null>(null);
  const generateSummary = useGenerateSummary();

  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const askAssistant = useAskAssistant();

  function handleGenerateSummary() {
    if (!selectedDisasterId) { toast.error("Select a disaster first."); return; }
    generateSummary.mutate(Number(selectedDisasterId), {
      onSuccess: (data) => setSummary(data.summary),
      onError: (e) => toast.error(getApiErrorMessage(e)),
    });
  }

  function handleAskQuestion(q?: string) {
    const text = (q ?? question).trim();
    if (!text) return;
    const userMsg: ChatMessage = { role: "user", content: text };
    setChatHistory((prev) => [...prev, userMsg]);
    setQuestion("");

    askAssistant.mutate(text, {
      onSuccess: (data) => setChatHistory((prev) => [...prev, { role: "assistant", content: data.answer }]),
      onError: (e) => {
        toast.error(getApiErrorMessage(e));
        setChatHistory((prev) => prev.slice(0, -1));
      },
    });
  }

  const selectedDisaster = disasters?.find((d) => String(d.id) === selectedDisasterId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">AI Intelligence Center</h2>
        <p className="text-sm text-muted-foreground">LLM-grounded situational intelligence — all answers are derived from live database state, not from model training data.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Feature A: Situation Summary */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-signal" /> AI Situation Summary
            </CardTitle>
            <CardDescription>Generates a 3–5 sentence operational brief for a disaster, with one concrete recommendation, based on current request data and road conditions.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <div className="flex gap-2">
              <Select value={selectedDisasterId} onValueChange={setSelectedDisasterId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a disaster..." />
                </SelectTrigger>
                <SelectContent>
                  {(disasters ?? []).map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name} ({d.city})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleGenerateSummary} disabled={generateSummary.isPending || !selectedDisasterId} className="gap-1.5 shrink-0">
                {generateSummary.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate
              </Button>
            </div>

            {selectedDisaster && (
              <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-3">
                <Flame className="h-4 w-4 shrink-0 text-warning" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{selectedDisaster.name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <DisasterStatusBadge status={selectedDisaster.status} />
                    <SeverityIndicator severity={selectedDisaster.severity} showLabel={false} />
                  </div>
                </div>
              </div>
            )}

            {generateSummary.isPending && (
              <div className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-signal" /> Generating situational brief...
              </div>
            )}

            {summary && !generateSummary.isPending && (
              <div className="flex-1 rounded-lg border border-signal/20 bg-signal/5 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-signal">
                  <Sparkles className="h-3 w-3" /> AI Situation Report
                </div>
                <p className="text-sm leading-relaxed text-foreground">{summary}</p>
              </div>
            )}

            {!summary && !generateSummary.isPending && (
              <div className="flex flex-1 items-center justify-center">
                <EmptyState icon={FileText} title="No summary generated yet" description="Select a disaster and click Generate to produce an AI situation brief." />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature B: Operations Assistant Chat */}
        <Card className="flex flex-col" style={{ minHeight: 480 }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-signal" /> AI Operations Assistant
            </CardTitle>
            <CardDescription>Ask any question about the current operational picture. The model answers only from live database state — no guessing.</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col gap-3">
            {/* Example questions */}
            {chatHistory.length === 0 && (
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Suggested questions</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_QUESTIONS.map((q) => (
                    <button key={q} onClick={() => handleAskQuestion(q)}
                      className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-signal/40 hover:text-foreground">
                      {q}
                    </button>
                  ))}
                </div>
                <Separator />
              </div>
            )}

            {/* Chat messages */}
            <ScrollArea className="flex-1 pr-1" style={{ maxHeight: 280 }}>
              <div className="space-y-3">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-signal/15 text-foreground ring-1 ring-inset ring-signal/25"
                        : "border border-border bg-surface text-foreground"
                    }`}>
                      {msg.role === "assistant" && (
                        <div className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-signal">
                          <Sparkles className="h-3 w-3" /> AI Assistant
                        </div>
                      )}
                      {msg.content}
                    </div>
                  </div>
                ))}
                {askAssistant.isPending && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-signal" /> Consulting live data...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2 border-t border-border pt-3">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAskQuestion(); } }}
                placeholder="Ask about resources, disasters, routes, volunteers..."
                rows={2}
                className="flex-1 resize-none text-sm"
              />
              <Button onClick={() => handleAskQuestion()} disabled={askAssistant.isPending || !question.trim()} size="icon" className="h-auto shrink-0 self-end">
                {askAssistant.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
