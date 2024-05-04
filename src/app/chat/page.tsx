"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  ArrowUp,
  CalendarIcon,
  CopyIcon,
  Loader2,
  Pause,
  PauseCircle,
  Send,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Socket, io } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import {
  ChatState,
  addMessage,
  updateMessage,
} from "@/providers/slice/chatbotSlice";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { IoIosCopy, IoIosCheckmarkCircleOutline } from "react-icons/io";
import { toast } from "sonner";
import CustomToast from "@/components/global/custom-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type Props = {
  params: {
    id: string;
  };
};

const UserMessage = ({ message }: { message: string }) => (
  <div>
    <div className="flex items-center gap-2">
      <Image src="/assets/ncbai.svg" alt="Chatbot" width={35} height={35} />
      <p className="text-muted-foreground font-medium">{message}</p>
    </div>
  </div>
);

const customStyle = {
  lineHeight: "1.5",
  fontSize: "1.2rem",
  borderRadius: "5px",
  backgroundColor: "#020024",
  padding: "20px",
};

const ChatbotMessage = ({ message }: { message: string }) => {
  const [copied, setCopied] = useState(false);
  const hasCode = message?.includes("<code>") && message.includes("</code>");
  let chunks: string[] = [message];

  if (hasCode) {
    chunks = message.split(/(<code>[\s\S]*?<\/code>)/g);
  }

  const copy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 5000);
  };
  const notify = () => {
    copy();
    toast(
      CustomToast({
        title: "Copied to clipboard !",
        description: "",
      })
    );
  };

  return (
    <div>
      <div className="mb-4 bg-card p-6 py-8 rounded-xl text-muted-foreground font-medium tracking-wide leading-snug border border-primary">
        {chunks.map((chunk, index) => {
          if (
            hasCode &&
            chunk.startsWith("<code>") &&
            chunk.endsWith("</code>")
          ) {
            const codeContent = chunk.slice(7, -8);
            return (
              <>
                <div className="relative">
                  <Button
                    className="absolute top-4 right-2 p-2"
                    size={"icon"}
                    variant={"outline"}
                  >
                    <CopyToClipboard text={codeContent} onCopy={() => notify()}>
                      {copied ? (
                        <IoIosCheckmarkCircleOutline className="text-lg m-1 text-green-500 w-4 h-4" />
                      ) : (
                        <CopyIcon className="text-lg m-1  w-4 h-4 hover:text-white" />
                      )}
                    </CopyToClipboard>
                  </Button>
                </div>
                <SyntaxHighlighter
                  key={index}
                  language="javascript"
                  style={vscDarkPlus}
                  customStyle={customStyle}
                  showLineNumbers
                >
                  {codeContent}
                </SyntaxHighlighter>
              </>
            );
          } else {
            return (
              <p key={index} className="text-base font-medium">
                {chunk}
              </p>
            );
          }
        })}
      </div>
      <div className="flex text-muted-foreground flex-row-reverse mr-4">
        <button className="p-1 hover:text-white">
          <CopyIcon className="w-4 h-4" />
        </button>
        <button className="p-1 hover:text-white">
          <ThumbsUp className="w-4 h-4" />
        </button>
        <button className="p-1 hover:text-white">
          <ThumbsDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const AssistantIdByPage = ({ params }: Props) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [date, setDate] = React.useState<Date>();

  const messages = useAppSelector((state) =>
    state.chatbot.threads?.filter(
      (thread: any) => thread.assistantId === params.id
    )
  );
  const form = useForm();

  const dispatch = useAppDispatch();
  const URL = `http://localhost:3004?`;
  const socketRef = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(
    null
  );
  const [isInputDisabled, setInputDisabled] = useState(false);

  useEffect(() => {
    socketRef.current = io(URL, { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      console.log("Connected to socket server");
      setInputDisabled(false);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setInputDisabled(true);
    });

    socketRef.current.on("gptResponse", (data: any) => {
      console.log("Received data from server:", data);
      if (data.event === "textCreated") {
        dispatch(
          addMessage({
            assistantId: params.id,
            message: {
              role: "bot",
              content: "",
            },
          })
        );
      } else if (data.event === "textDelta") {
        dispatch(updateMessage({ assistantId: params.id, message: data.data }));
        setInputDisabled(false);
      }
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => {
      //cleaning function
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [URL, dispatch, params.id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = form.getValues("query");
    if (query.trim() === "") {
      console.error("Query cannot be empty.");
      return;
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    setInputDisabled(true);
    try {
      if (socketRef.current) {
        console.log("emitting .....");
        socketRef.current.emit("runAssistant", JSON.stringify({ query }));
        dispatch(
          addMessage({
            assistantId: params.id,
            message: {
              role: "user",
              content: query,
            },
          })
        );
        form.setValue("query", "");
      }
    } catch (error) {
      console.error("Error running assistant: ", error);
      setInputDisabled(false);
    }
  };

  return (
    <div className="stretch mx-auto w-full md:w-3/4 max-w-5xl pt-24 pb-40">
      <div className="fixed left-1/2 transform -translate-x-1/2">
        {messages && messages.length === 0 && (
          <div className="flex items-center justify-center flex-col gap-10">
            <section className="flex gap-6 items-center justify-center  p-4">
              <div className="flex items-center text-3xl font-semibold gap-8 tracking-wide">
                PAKNEWS.AI
              </div>
            </section>
            <section>
              {" "}
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-10">
              <div className="bg-neutral-200/50 p-8 rounded-xl flex items-center justify-center flex-col text-center gap-2">
                <h2 className="font-semibold text-lg">GENERATE A SUMMARY</h2>
                <p className="text-muted-foreground text-xs">
                  Generate a summary of the news
                </p>
              </div>
              <div className="bg-neutral-200/50 p-8 rounded-xl flex items-center justify-center flex-col text-center gap-2">
                <h2 className="font-semibold text-lg">ASK QUESTIONS</h2>
                <p className="text-muted-foreground text-xs">
                  Ask Questions about todays news
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {messages &&
        messages[0]?.messages?.map((message: ChatState, index: number) => (
          <div key={index} className="mb-8 whitespace-pre-wrap">
            {message.role === "user" ? (
              <>
                <UserMessage message={message.content} />
                <div ref={messagesEndRef} />
              </>
            ) : (
              <>
                <ChatbotMessage message={message.content} />
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        ))}

      <div className="flex flex-col items-center justify-center">
        <div className="fixed bottom-0 w-full md:w-2/3 max-w-7xl px-10 pb-10">
          <div className="relative">
            <form onSubmit={handleSubmit}>
              <Input
                {...form.register("query")}
                type="text"
                placeholder="Ask Anything"
                className="mt-4 border-primary/20 bg-card rounded-lg text-muted-foreground px-6 py-7 shadow-sm"
                disabled={isInputDisabled || !date}
              />
              <Button
                type="submit"
                variant={
                  form.watch("query") && form.watch("query").trim().length > 0
                    ? "default"
                    : "ghost"
                }
                size={"icon"}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:bg-primary"
                disabled={isInputDisabled}
              >
                {isInputDisabled ? (
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AssistantIdByPage;