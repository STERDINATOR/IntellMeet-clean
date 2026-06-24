import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Hand,
  Smile,
  Captions,
  Circle,
  PhoneOff,
  Sparkles,
  MessageSquare,
  Users,
  FileText,
  StopCircle,
  Loader2,
} from "lucide-react";
import { useMeetingsStore, useAuthStore } from "@/lib/stores";
import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { meetingService, chatService } from "@/lib/api/services";
import { apiClient } from "@/lib/api/client";
import { motion } from "framer-motion";
import { socketClient } from "@/lib/realtime";
import {
  peerConnectionManager,
  localStreamManager,
  useMeetingMediaStore,
} from "@/lib/meeting-media";
import { useLiveTranscription } from "@/lib/live-transcription";

export const Route = createFileRoute("/app/room/$id")({ component: Room });

type TranscriptLineDelta = {
  meetingId: string;
  speaker: string;
  text: string;
  atSeconds: number;
};

type MeetingLike = { id: string; title?: string; participants: string[] };

type ChatMessage = {
  user: string;
  text: string;
};

type TranscriptLine = {
  id: string;
  speaker: string;
  text: string;
  atSeconds: number;
};

type SocketUserEventChatMessage = {
  userId?: string;
  name?: string;
  text: string;
};

type SocketPeerJoined = { peerId: string };

type SocketExistingPeers = { peerId: string; userId: string };

type SocketWebrtcOfferEvent = {
  from: string;
  offer: RTCSessionDescriptionInit;
};

type SocketWebrtcAnswerEvent = {
  from: string;
  answer: RTCSessionDescriptionInit;
};

type SocketIceCandidateEvent = {
  from: string;
  candidate: RTCIceCandidateInit;
};

type SocketPeerLeft = { peerId: string };

type SocketTranscriptCreated = {
  _id?: string;
  id?: string;
  speaker?: string;
  text?: string;
  atSeconds?: number;
};

type SocketTranscriptUpdated = { meetingId?: string };

type SocketAiInsightsUpdated = { insights: Array<{ title?: string }> };

type RemoteUser = {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
};

function VideoTile({
  stream,
  muted = false,
  className = "",
}: {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.srcObject = stream;
  }, [stream]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={`w-full h-full object-cover ${className}`}
    />
  );
}

function Room() {
  const { id } = Route.useParams();
  const meeting = useMeetingsStore((s) => s.meetings.find((m) => m.id === id));
  const updateMeeting = useMeetingsStore((s) => s.update);
  const navigate = useNavigate();
  const setMediaState = useMeetingMediaStore((s) => s.set);

  const [remoteMeeting, setRemoteMeeting] = useState<MeetingLike | null>(null);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [share, setShare] = useState(false);
  const [hand, setHand] = useState(false);
  const [caps, setCaps] = useState(true);
  const [rec, setRec] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const [remoteStreams, setRemoteStreams] = useState<
    Record<string, MediaStream>
  >({});

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [liveInsights, setLiveInsights] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeMeeting = (meeting ?? remoteMeeting) as
    | (Partial<MeetingLike> & { participants?: string[] })
    | null;

  const currentUser = useAuthStore((s) => s.user);
  const [teamUsers, setTeamUsers] = useState<
    Array<{ id: string; name: string; avatar?: string; role?: string }>
  >([]);

  useEffect(() => {
    import("@/lib/api/services").then(({ userService }) =>
      userService
        .list()
        .then((data) => {
          const normalized = (data as unknown[])
            .map(
              (u) =>
                u as {
                  id?: string;
                  _id?: string;
                  name?: string;
                  avatar?: string;
                  role?: string;
                },
            )
            .filter(
              (u) =>
                typeof u?.name === "string" &&
                typeof (u.id ?? u._id) === "string",
            )
            .map((u) => ({
              id: u.id ?? u._id!,
              name: u.name!,
              avatar: u.avatar,
              role: u.role,
            }));
          setTeamUsers(normalized);
        })
        .catch(() => undefined),
    );
  }, []);

  const getUser = (id: string) =>
    teamUsers.find((u) => u.id === id) ?? {
      id,
      name: "Unknown",
      avatar: "",
      role: "",
    };

  const participants: RemoteUser[] = activeMeeting
    ? [
        {
          id: currentUser.id,
          name: currentUser.name ?? "Unknown",
          avatar: currentUser.avatar,
          role: currentUser.role,
        },
        ...(activeMeeting.participants ?? [])
          .filter((p) => p !== "me")
          .map((pid) => {
            const u = getUser(pid);
            return { id: u.id, name: u.name, avatar: u.avatar, role: u.role };
          }),
      ]
    : [
        {
          id: currentUser.id,
          name: currentUser.name ?? "Unknown",
          avatar: currentUser.avatar,
          role: currentUser.role,
        },
      ];

  const remoteParticipants = participants.filter((p) => p.id !== "me");

  const { supported, listening, interim, start, stop } = useLiveTranscription(
    (line) => {
      socketClient.emit("transcript:delta", {
        meetingId: id,
        speaker: line.speaker,
        text: line.text,
        // keep atSeconds deterministic client-side for UI ordering
        atSeconds: 0,
      } satisfies TranscriptLineDelta);
    },
  );

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Wire peer connection callbacks
  useEffect(() => {
    peerConnectionManager.onIceCandidate = (peerId, candidate) => {
      socketClient.emit("webrtc:ice-candidate", { to: peerId, candidate });
    };

    peerConnectionManager.onRemoteTrack = (peerId, stream) => {
      setRemoteStreams((prev) => ({ ...prev, [peerId]: stream }));
    };

    return () => {
      peerConnectionManager.onIceCandidate = null;
      peerConnectionManager.onRemoteTrack = null;
    };
  }, []);

  // Acquire local camera+mic
  useEffect(() => {
    let cancelled = false;

    localStreamManager.acquire().then((stream) => {
      if (!cancelled) {
        setLocalStream(stream);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Main socket + data effect
  useEffect(() => {
    if (!meeting) {
      meetingService
        .get(id)
        .then((remote) => {
          if (remote) setRemoteMeeting(remote);
        })
        .catch(() => toast.error("Unable to load meeting details."));
    }

    // Load chat history
    chatService
      .history(id)
      .then((msgs) => {
        if (msgs?.length) {
          setChat(
            msgs.map((m: { name?: string; userId?: string; text: string }) => ({
              user: m.name ?? m.userId ?? "Teammate",
              text: m.text,
            })),
          );
        }
      })
      .catch(() => undefined);

    socketClient.emit("meeting:join", { roomId: id });

    const offChat = socketClient.on<SocketUserEventChatMessage>(
      "chat:message",
      (msg) => {
        setChat((prev) => [
          ...prev,
          {
            user: msg.name ?? (msg.userId === "me" ? "You" : "Teammate"),
            text: msg.text,
          },
        ]);
      },
    );

    const offPeerJoined = socketClient.on<SocketPeerJoined>(
      "meeting:peer-joined",
      () => {
        // New peer will initiate the offer; existing peers wait to receive it.
      },
    );

    const offExistingPeers = socketClient.on<SocketExistingPeers[]>(
      "meeting:existing-peers",
      async (peers) => {
        for (const { peerId } of peers) {
          const offer = await peerConnectionManager.createOffer(
            peerId,
            localStreamManager.get(),
          );
          socketClient.emit("webrtc:offer", { to: peerId, offer });
        }
      },
    );

    const offOffer = socketClient.on<SocketWebrtcOfferEvent>(
      "webrtc:offer",
      async ({ from, offer }) => {
        const answer = await peerConnectionManager.createAnswer(
          from,
          offer,
          localStreamManager.get(),
        );
        socketClient.emit("webrtc:answer", { to: from, answer });
      },
    );

    const offAnswer = socketClient.on<SocketWebrtcAnswerEvent>(
      "webrtc:answer",
      ({ from, answer }) => {
        peerConnectionManager
          .get(from)
          ?.setRemoteDescription(answer)
          .catch(() => undefined);
      },
    );

    const offIce = socketClient.on<SocketIceCandidateEvent>(
      "webrtc:ice-candidate",
      ({ from, candidate }) => {
        peerConnectionManager
          .get(from)
          ?.addIceCandidate(candidate)
          .catch(() => undefined);
      },
    );

    const offPeerLeft = socketClient.on<SocketPeerLeft>(
      "meeting:peer-left",
      ({ peerId }) => {
        peerConnectionManager.close(peerId);
        setRemoteStreams((prev) => {
          const next = { ...prev };
          delete next[peerId];
          return next;
        });
      },
    );

    const offTranscript = socketClient.on<SocketTranscriptCreated>(
      "transcript:created",
      (created) => {
        setTranscript((prev) => [
          ...prev,
          {
            id: String(
              created._id ?? created.id ?? `${Date.now()}-${Math.random()}`,
            ),
            speaker: created.speaker ?? "Unknown",
            text: created.text ?? "",
            atSeconds:
              typeof created.atSeconds === "number" ? created.atSeconds : 0,
          },
        ]);
      },
    );

    const offTranscriptUpdated = socketClient.on<SocketTranscriptUpdated>(
      "transcript:updated",
      () => {},
    );

    const offAiInsights = socketClient.on<SocketAiInsightsUpdated>(
      "ai:insights_updated",
      ({ insights }) => {
        if (Array.isArray(insights)) {
          setLiveInsights(
            insights.map((i) => i.title ?? String(i)).filter(Boolean),
          );
        }
      },
    );

    return () => {
      socketClient.emit("meeting:leave", { roomId: id });
      offChat();
      offPeerJoined();
      offExistingPeers();
      offOffer();
      offAnswer();
      offIce();
      offPeerLeft();
      offTranscript();
      offTranscriptUpdated();
      offAiInsights();
      peerConnectionManager.closeAll();
      localStreamManager.release();
      setLocalStream(null);
      setRemoteStreams({});
      stop();
    };
  }, [id, meeting, stop]);

  useEffect(() => {
    if (!supported) return;
    if (rec && !listening) start();
    if (!rec && listening) stop();
  }, [rec, supported, listening, start, stop]);

  const toggleMic = useCallback(() => {
    const next = !mic;
    setMic(next);
    localStreamManager.setMicEnabled(next);
    setMediaState({ mic: next });
    socketClient.emit("meeting:control", {
      roomId: id,
      control: "mic",
      value: next,
    });
  }, [mic, id, setMediaState]);

  const toggleCam = useCallback(() => {
    const next = !cam;
    setCam(next);
    localStreamManager.setCamEnabled(next);
    setMediaState({ camera: next });
    socketClient.emit("meeting:control", {
      roomId: id,
      control: "camera",
      value: next,
    });
  }, [cam, id, setMediaState]);

  const toggleScreenShare = useCallback(async () => {
    if (share) {
      setShare(false);
      setMediaState({ screenSharing: false });
      await localStreamManager.restoreCamera();

      const camTrack = localStreamManager.get()?.getVideoTracks()[0] ?? null;
      peerConnectionManager.replaceTrack("video", camTrack);
      setLocalStream(localStreamManager.get());

      socketClient.emit("meeting:control", {
        roomId: id,
        control: "screenSharing",
        value: false,
      });

      toast.success("Stopped sharing");
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      peerConnectionManager.replaceTrack("video", screenTrack);
      localStreamManager.replaceWithScreenTrack(screenStream);
      setLocalStream(localStreamManager.get());

      screenTrack.onended = async () => {
        setShare(false);
        setMediaState({ screenSharing: false });
        await localStreamManager.restoreCamera();

        const t = localStreamManager.get()?.getVideoTracks()[0] ?? null;
        peerConnectionManager.replaceTrack("video", t);
        setLocalStream(localStreamManager.get());

        socketClient.emit("meeting:control", {
          roomId: id,
          control: "screenSharing",
          value: false,
        });
        toast.success("Stopped sharing");
      };

      setShare(true);
      setMediaState({ screenSharing: true });
      socketClient.emit("meeting:control", {
        roomId: id,
        control: "screenSharing",
        value: true,
      });
      toast.success("Started sharing");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Screen sharing permission was not granted (${msg})`);
    }
  }, [share, id, setMediaState]);

  const leave = async () => {
    socketClient.emit("meeting:leave", { roomId: id });
    stop();
    await meetingService.update(id, { status: "ended", score: 91 });
    updateMeeting(id, { status: "ended", score: 91 });
    toast.success("Meeting ended and summary queued");
    navigate({ to: "/app/meetings" });
  };

  const generateTasks = async () => {
    setGeneratingTasks(true);
    try {
      const items = await apiClient.post<Array<unknown>>(
        `/ai/meetings/${id}/action-items`,
      );
      toast.success(`${items.length} tasks generated from meeting transcript`);
    } catch {
      toast.error("Failed to generate tasks. Ensure backend is running.");
    } finally {
      setGeneratingTasks(false);
    }
  };

  return (
    <div className="-m-4 md:-m-8 h-[calc(100vh-4rem)] flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <div className="font-semibold">
            {activeMeeting?.title ?? "Meeting"}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Live • {participants.length} participants
            {rec && <span className="text-destructive ml-1">● Recording</span>}
          </div>
        </div>
        <Button variant="destructive" onClick={leave}>
          <PhoneOff className="h-4 w-4 mr-2" />
          Leave
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-4 overflow-auto">
          <div
            className={`grid gap-3 h-full ${participants.length <= 2 ? "grid-cols-1 md:grid-cols-2" : participants.length <= 4 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}
          >
            {/* Local tile */}
            <motion.div
              key="me"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-secondary to-card border border-border min-h-[180px] flex items-center justify-center"
            >
              {cam && localStream ? (
                <VideoTile
                  stream={localStream}
                  muted
                  className="absolute inset-0"
                />
              ) : (
                <Avatar className="h-24 w-24 ring-4 ring-primary/30">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>
                    {(currentUser.name ?? "U")[0]}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                <div className="px-2 py-1 rounded-md bg-background/70 backdrop-blur text-xs font-medium">
                  {currentUser.name} (You)
                </div>
                {!mic && (
                  <div className="h-7 w-7 rounded-md bg-destructive/80 flex items-center justify-center">
                    <MicOff className="h-3 w-3 text-destructive-foreground" />
                  </div>
                )}
              </div>
              {hand && (
                <div className="absolute top-3 right-3 text-xl z-10">✋</div>
              )}
            </motion.div>

            {/* Remote tiles */}
            {remoteParticipants.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (i + 1) * 0.05 }}
                className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-secondary to-card border border-border min-h-[180px] flex items-center justify-center"
              >
                {remoteStreams[p.id] ? (
                  <VideoTile
                    stream={remoteStreams[p.id]}
                    className="absolute inset-0"
                  />
                ) : (
                  <Avatar className="h-24 w-24 ring-4 ring-primary/30">
                    <AvatarImage src={p.avatar} />
                    <AvatarFallback>{p.name[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                  <div className="px-2 py-1 rounded-md bg-background/70 backdrop-blur text-xs font-medium">
                    {p.name}
                  </div>
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="hidden lg:flex w-96 border-l border-border flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="m-3">
              <TabsTrigger value="chat">
                <MessageSquare className="h-3 w-3 mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="participants">
                <Users className="h-3 w-3 mr-1" />
                People
              </TabsTrigger>
              <TabsTrigger value="transcript">
                <FileText className="h-3 w-3 mr-1" />
                Live
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Sparkles className="h-3 w-3 mr-1" />
                AI
              </TabsTrigger>
            </TabsList>

            {/* Chat */}
            <TabsContent
              value="chat"
              className="flex-1 flex flex-col px-3 pb-3 m-0 data-[state=inactive]:hidden"
            >
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {chat.map((m, i) => (
                  <div key={i} className="rounded-lg bg-secondary/60 p-2">
                    <div className="text-xs font-semibold">{m.user}</div>
                    <div className="text-sm">{m.text}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!input.trim()) return;
                  socketClient.emit("chat:message", {
                    roomId: id,
                    text: input,
                  });
                  setChat((c) => [...c, { user: "You", text: input }]);
                  setInput("");
                }}
                className="mt-2 flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message…"
                  className="flex-1 bg-secondary/60 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 ring-primary/40"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="gradient-primary text-primary-foreground border-0"
                >
                  Send
                </Button>
              </form>
            </TabsContent>

            {/* Participants */}
            <TabsContent
              value="participants"
              className="px-3 pb-3 space-y-2 overflow-y-auto m-0 data-[state=inactive]:hidden"
            >
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/60"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={p.avatar} />
                    <AvatarFallback>{p.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {p.name}
                      {p.id === "me" && " (You)"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.role}
                    </div>
                  </div>
                  {p.id === "me" && !mic && (
                    <MicOff className="h-4 w-4 text-destructive" />
                  )}
                  {p.id !== "me" && remoteStreams[p.id] && (
                    <div className="h-2 w-2 rounded-full bg-success" />
                  )}
                </div>
              ))}
            </TabsContent>

            {/* Live transcript */}
            <TabsContent
              value="transcript"
              className="px-3 pb-3 overflow-y-auto space-y-2 m-0 data-[state=inactive]:hidden"
            >
              {transcript.length === 0
                ? []
                : transcript.map((t) => (
                    <div key={t.id} className="text-sm">
                      <span className="text-xs text-muted-foreground">
                        {t.atSeconds}s
                      </span>{" "}
                      <span className="font-semibold">{t.speaker}:</span>{" "}
                      {t.text}
                    </div>
                  ))}
              {rec && listening && interim && (
                <div className="text-xs text-muted-foreground italic">
                  Listening… {interim}
                </div>
              )}
            </TabsContent>

            {/* AI */}
            <TabsContent
              value="ai"
              className="px-3 pb-3 space-y-3 overflow-y-auto m-0 data-[state=inactive]:hidden"
            >
              <div className="rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 p-3 border border-primary/30">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Live insights
                </div>
                {liveInsights.length > 0 ? (
                  <ul className="text-sm mt-2 space-y-1 list-disc list-inside text-muted-foreground">
                    {liveInsights.map((insight, i) => (
                      <li key={i}>{insight}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground mt-2">
                    Insights will appear as the meeting progresses.
                  </p>
                )}
              </div>
              <Button
                className="w-full gradient-primary text-primary-foreground border-0"
                onClick={generateTasks}
                disabled={generatingTasks}
              >
                {generatingTasks ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate tasks from transcript
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 p-4 border-t border-border bg-card/60 backdrop-blur">
        <Ctl
          active={mic}
          onClick={toggleMic}
          on={Mic}
          off={MicOff}
          label="Mic"
        />
        <Ctl
          active={cam}
          onClick={toggleCam}
          on={Video}
          off={VideoOff}
          label="Camera"
        />
        <Ctl
          active={share}
          onClick={toggleScreenShare}
          on={StopCircle}
          off={ScreenShare}
          label={share ? "Stop sharing" : "Share screen"}
        />
        <Ctl
          active={hand}
          danger={false}
          onClick={() => {
            const next = !hand;
            setHand(next);
            setMediaState({ handRaised: next });
            socketClient.emit("meeting:control", {
              roomId: id,
              control: "handRaised",
              value: next,
            });
            toast.success(next ? "Hand raised ✋" : "Hand lowered");
          }}
          on={Hand}
          off={Hand}
          label="Hand"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="h-12 w-12 rounded-full"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <div className="flex gap-1">
              {["👍", "❤️", "😂", "🎉", "🔥", "👏"].map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    socketClient.emit("meeting:reaction", {
                      roomId: id,
                      emoji: e,
                    });
                    toast.success(`Reacted ${e}`);
                  }}
                  className="text-2xl hover:scale-125 transition"
                >
                  {e}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Ctl
          active={caps}
          onClick={() => {
            const next = !caps;
            setCaps(next);
            setMediaState({ captions: next });
          }}
          on={Captions}
          off={Captions}
          label="Captions"
        />
        <Ctl
          active={rec}
          danger
          onClick={() => {
            const next = !rec;
            setRec(next);
            setMediaState({ recording: next });
            socketClient.emit("meeting:control", {
              roomId: id,
              control: "recording",
              value: next,
            });
            toast.success(next ? "Recording started" : "Recording stopped");
            if (!supported && next) {
              toast.error("Live transcription not supported in this browser.");
            }
          }}
          on={Circle}
          off={Circle}
          label="Record"
        />
      </div>
    </div>
  );
}

function Ctl({
  active,
  onClick,
  on: On,
  off: Off,
  label,
  danger,
}: {
  active: boolean;
  onClick: () => void;
  on: React.ComponentType<{ className?: string }>;
  off: React.ComponentType<{ className?: string }>;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`h-12 w-12 rounded-full flex items-center justify-center transition ${
        danger && active
          ? "bg-destructive text-destructive-foreground"
          : active
            ? "gradient-primary text-primary-foreground glow"
            : "bg-secondary text-foreground hover:bg-secondary/70"
      }`}
    >
      {active ? <On className="h-5 w-5" /> : <Off className="h-5 w-5" />}
    </button>
  );
}
