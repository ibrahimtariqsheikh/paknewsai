"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  ArrowUp,
  CalendarIcon,
  CopyIcon,
  Loader2,
  Send,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { ChatState, addMessage } from "@/providers/slice/chatbotSlice";
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
import { apiClient } from "@/lib/api/apiService";

type Props = {
  params: {
    id: string;
  };
};

const CategoryButton = ({
  category,
  date,
  onClick,
}: {
  category: string;
  date: Date | undefined;
  onClick: () => void;
}) => {
  return (
    <button
      className="p-2 rounded-full bg-neutral-200/30 text-xs text-primary/90 flex items-center justify-center hover:bg-neutral-200/80 transition-all hover:scale-105 hover:text-primary hover:font-bold"
      onClick={onClick}
      disabled={!date}
    >
      <span>{category}</span>
    </button>
  );
};

const UserMessage = ({ message }: { message: string }) => (
  <div>
    <div className="flex items-center gap-2">
      <Image
        src="/icons8-news.svg"
        alt="Chatbot"
        width={20}
        height={20}
        className="text-muted-foreground"
      />
      <p className="text-primary/90 font-medium">{message}</p>
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
      <div className="">
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
  const [date, setDate] = React.useState<Date>();
  const [formattedDate, setFormattedDate] = React.useState<string>("");
  const [isInputDisabled, setIsInputDisables] = React.useState<boolean>(false);

  const messages = useAppSelector((state) =>
    state.chatbot.threads?.filter(
      (thread: any) => thread.assistantId === params.id
    )
  );
  const form = useForm();

  const dispatch = useAppDispatch();

  const getQA = async (query: string) => {
    if (!formattedDate) {
      return;
    }
    const url = `http://192.168.0.148:8000/qa?query=${encodeURIComponent(
      query
    )}&date=${formattedDate}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const data = await response.json();
    console.log("data", data);
    dispatch(
      addMessage({
        assistantId: params.id,
        message: {
          role: "bot",
          content: data.Response,
        },
      })
    );
  };

  const getSummary = async (category: string) => {
    if (!formattedDate) {
      return;
    }
    console.log("here");
    const url = `http://192.168.0.148:8000/summarize?category=${encodeURIComponent(
      category
    )}&date=${formattedDate}`;
    console.log("url", url);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    console.log("response", response);
    const data = await response.json();
    setIsInputDisables(false);
    console.log("data", data);
    dispatch(
      addMessage({
        assistantId: params.id,
        message: {
          role: "bot",
          content: data.Response,
        },
      })
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = form.getValues("query");
    if (query.trim() === "") {
      console.error("Query cannot be empty.");
      return;
    }

    try {
      getQA(query);
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
    } catch (error) {
      console.error("Error running assistant: ", error);
    }
  };

  const Categories = () => {
    return (
      <section>
        <div className="grid grid-cols-5 mt-3 gap-2">
          <CategoryButton
            category="Sports"
            date={date}
            onClick={() => {
              if (!date) {
                console.log("date", date);
                toast(
                  CustomToast({
                    title: "Please select a date",
                    description: "Please select a date to generate a summary",
                  })
                );
                setDate(new Date());
                setFormattedDate(new Date().toISOString().split("T")[0]);
              }
              dispatch(
                addMessage({
                  assistantId: params.id,
                  message: {
                    role: "user",
                    content: `Generate a summary of sports news for ${formattedDate}`,
                  },
                })
              );
              setIsInputDisables(true);
              getSummary("sports");
            }}
          />
          <CategoryButton
            category="Business"
            date={date}
            onClick={() => {
              if (!date) {
                toast(
                  CustomToast({
                    title: "Please select a date",
                    description: "Please select a date to generate a summary",
                  })
                );
                return;
              }
              dispatch(
                addMessage({
                  assistantId: params.id,
                  message: {
                    role: "user",
                    content: "Generate a summary of business news",
                  },
                })
              );
              setIsInputDisables(true);
              getSummary("business");
            }}
          />
          <CategoryButton
            category="Politics"
            date={date}
            onClick={() => {
              if (!date) {
                toast(
                  CustomToast({
                    title: "Please select a date",
                    description: "Please select a date to generate a summary",
                  })
                );
                return;
              }
              dispatch(
                addMessage({
                  assistantId: params.id,
                  message: {
                    role: "user",
                    content: "Generate a summary of politics news",
                  },
                })
              );
              setIsInputDisables(true);
              getSummary("politics");
            }}
          />
          <CategoryButton
            category="Education"
            date={date}
            onClick={() => {
              if (!date) {
                toast(
                  CustomToast({
                    title: "Please select a date",
                    description: "Please select a date to generate a summary",
                  })
                );
                return;
              }
              dispatch(
                addMessage({
                  assistantId: params.id,
                  message: {
                    role: "user",
                    content: "Generate a summary of education news",
                  },
                })
              );
              setIsInputDisables(true);
              getSummary("education");
            }}
          />
          <CategoryButton
            category="Finances"
            date={date}
            onClick={() => {
              if (!date) {
                toast(
                  CustomToast({
                    title: "Please select a date",
                    description: "Please select a date to generate a summary",
                  })
                );
                return;
              }
              dispatch(
                addMessage({
                  assistantId: params.id,
                  message: {
                    role: "user",
                    content: "Generate a summary of finance news",
                  },
                })
              );
              setIsInputDisables(true);
              getSummary("finances");
            }}
          />
          <CategoryButton
            category="Money"
            date={date}
            onClick={() => {
              if (!date) {
                toast(
                  CustomToast({
                    title: "Please select a date",
                    description: "Please select a date to generate a summary",
                  })
                );
                return;
              }
              dispatch(
                addMessage({
                  assistantId: params.id,
                  message: {
                    role: "user",
                    content: "Generate a summary of money news",
                  },
                })
              );
              setIsInputDisables(true);
              getSummary("money");
            }}
          />
        </div>
      </section>
    );
  };

  return (
    <div className="stretch mx-auto w-full md:w-3/4 max-w-5xl py-20">
      {messages && messages.length > 0 && (
        <>
          <h1 className="text-2xl font-bold w-full text-center mb-10">
            PAKNEWS.AI
          </h1>
        </>
      )}
      <div className="fixed left-1/2 transform -translate-x-1/2">
        {messages && messages.length === 0 && (
          <>
            {" "}
            <section className="flex gap-6 items-center justify-center  p-4">
              <div className="flex items-center text-5xl font-bold gap-8 tracking-wide">
                PAKNEWS.AI
              </div>
            </section>
            <div className="flex items-start justify-center flex-col gap-10  mt-4">
              <section>
                <div className="flex flex-col gap-2">
                  <h1 className="text-xl font-bold">Pick a Date</h1>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[400px] justify-start text-left font-normal",
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
                        onSelect={(date) => {
                          console.log("date", date);
                          if (date) {
                            const formattedDate = date
                              .toISOString()
                              .split("T")[0];
                            console.log("formattedDate", formattedDate);
                            setFormattedDate(formattedDate);
                            setDate(date);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </section>
              <div>
                <h1 className="text-xl font-bold">Generate a summary</h1>
                <Categories />
              </div>
            </div>
          </>
        )}
      </div>

      {messages &&
        messages[0]?.messages?.map((message: ChatState, index: number) => (
          <>
            <div key={index} className="mb-8 whitespace-pre-wrap">
              {message.role === "user" ? (
                <>
                  <UserMessage message={message.content} />
                </>
              ) : (
                <>
                  <ChatbotMessage message={message.content} />
                </>
              )}
            </div>
          </>
        ))}

      {messages && messages.length > 0 && (
        <>
          <Categories />
        </>
      )}

      <div className="flex flex-col items-center justify-center ">
        <div className="fixed bottom-0 w-full px-10 pb-10 bg-background grainy">
          <div className="relative w-2/3 mx-auto">
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
                className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:bg-primary group"
              >
                {isInputDisabled ? (
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin group-hover:text-white" />
                ) : (
                  <ArrowUp
                    className={`w-5 h-5 text-muted-foreground group-hover:text-white ${
                      form.watch("query") &&
                      form.watch("query").trim().length > 0
                        ? "text-white"
                        : ""
                    }`}
                  />
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
