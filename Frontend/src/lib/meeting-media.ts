import { create } from "zustand";

export type NetworkQuality = "excellent" | "good" | "fair" | "poor";

export class MediaDeviceManager {
  async getDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) return [];
    return navigator.mediaDevices.enumerateDevices();
  }

  async getUserMedia(constraints: MediaStreamConstraints) {
    if (!navigator.mediaDevices?.getUserMedia)
      throw new Error("Media devices are not available in this browser.");
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  async getDisplayMedia() {
    if (!navigator.mediaDevices?.getDisplayMedia)
      throw new Error("Screen sharing is not available in this browser.");
    return navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
  }
}

type IceSendFn = (peerId: string, candidate: RTCIceCandidateInit) => void;
type TrackFn = (peerId: string, stream: MediaStream) => void;

export class PeerConnectionManager {
  private peers = new Map<string, RTCPeerConnection>();
  private remoteStreams = new Map<string, MediaStream>();
  onIceCandidate: IceSendFn | null = null;
  onRemoteTrack: TrackFn | null = null;

  create(peerId: string, localStream?: MediaStream | null) {
    const existing = this.peers.get(peerId);
    if (existing) return existing;
    const connection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });
    if (localStream) {
      localStream
        .getTracks()
        .forEach((track) => connection.addTrack(track, localStream));
    }
    connection.onicecandidate = ({ candidate }) => {
      if (candidate) this.onIceCandidate?.(peerId, candidate.toJSON());
    };
    connection.ontrack = ({ streams }) => {
      const stream = streams[0];
      if (!stream) return;
      this.remoteStreams.set(peerId, stream);
      this.onRemoteTrack?.(peerId, stream);
    };
    this.peers.set(peerId, connection);
    return connection;
  }

  get(peerId: string) {
    return this.peers.get(peerId);
  }

  getRemoteStream(peerId: string) {
    return this.remoteStreams.get(peerId) ?? null;
  }

  async createOffer(peerId: string, localStream?: MediaStream | null) {
    const connection = this.create(peerId, localStream);
    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(
    peerId: string,
    offer: RTCSessionDescriptionInit,
    localStream?: MediaStream | null,
  ) {
    const connection = this.create(peerId, localStream);
    await connection.setRemoteDescription(offer);
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
    return answer;
  }

  replaceTrack(kind: "audio" | "video", newTrack: MediaStreamTrack | null) {
    this.peers.forEach((connection) => {
      const sender = connection
        .getSenders()
        .find((s) => s.track?.kind === kind);
      if (sender) sender.replaceTrack(newTrack).catch(() => undefined);
    });
  }

  close(peerId: string) {
    this.peers.get(peerId)?.close();
    this.peers.delete(peerId);
    this.remoteStreams.delete(peerId);
  }

  closeAll() {
    this.peers.forEach((peer) => peer.close());
    this.peers.clear();
    this.remoteStreams.clear();
  }
}

/** Holds the local MediaStream so it can be reused across the component lifecycle. */
export class LocalStreamManager {
  private stream: MediaStream | null = null;

  async acquire() {
    if (this.stream) return this.stream;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    } catch {
      // Camera/mic denied — return a silent black stream so UI still works
      this.stream = new MediaStream();
    }
    return this.stream;
  }

  get() {
    return this.stream;
  }

  setMicEnabled(enabled: boolean) {
    this.stream?.getAudioTracks().forEach((t) => {
      t.enabled = enabled;
    });
  }

  setCamEnabled(enabled: boolean) {
    this.stream?.getVideoTracks().forEach((t) => {
      t.enabled = enabled;
    });
  }

  replaceWithScreenTrack(screenStream: MediaStream) {
    const videoTrack = screenStream.getVideoTracks()[0];
    if (!videoTrack) return;
    // Swap into local stream for preview
    this.stream?.getVideoTracks().forEach((t) => this.stream?.removeTrack(t));
    this.stream?.addTrack(videoTrack);
    videoTrack.onended = () => this.restoreCamera();
  }

  async restoreCamera() {
    try {
      const cam = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = cam.getVideoTracks()[0];
      if (!track) return;
      this.stream?.getVideoTracks().forEach((t) => {
        t.stop();
        this.stream?.removeTrack(t);
      });
      this.stream?.addTrack(track);
    } catch {
      /* ignore */
    }
  }

  release() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }
}

export const mediaDeviceManager = new MediaDeviceManager();
export const peerConnectionManager = new PeerConnectionManager();
export const localStreamManager = new LocalStreamManager();

type MeetingMediaState = {
  mic: boolean;
  camera: boolean;
  captions: boolean;
  recording: boolean;
  handRaised: boolean;
  screenSharing: boolean;
  networkQuality: NetworkQuality;
  set: (patch: Partial<Omit<MeetingMediaState, "set">>) => void;
};

export const useMeetingMediaStore = create<MeetingMediaState>((set) => ({
  mic: true,
  camera: true,
  captions: true,
  recording: false,
  handRaised: false,
  screenSharing: false,
  networkQuality: "excellent",
  set: (patch) => set(patch),
}));
