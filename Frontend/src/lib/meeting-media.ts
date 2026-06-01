import { create } from "zustand";

export type NetworkQuality = "excellent" | "good" | "fair" | "poor";

export class MediaDeviceManager {
  async getDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) return [];
    return navigator.mediaDevices.enumerateDevices();
  }

  async getUserMedia(constraints: MediaStreamConstraints) {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("Media devices are not available in this browser.");
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  async getDisplayMedia() {
    if (!navigator.mediaDevices?.getDisplayMedia) throw new Error("Screen sharing is not available in this browser.");
    return navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
  }
}

export class PeerConnectionManager {
  private peers = new Map<string, RTCPeerConnection>();

  create(peerId: string) {
    const connection = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    this.peers.set(peerId, connection);
    return connection;
  }

  get(peerId: string) {
    return this.peers.get(peerId);
  }

  close(peerId: string) {
    this.peers.get(peerId)?.close();
    this.peers.delete(peerId);
  }

  closeAll() {
    this.peers.forEach((peer) => peer.close());
    this.peers.clear();
  }
}

export const mediaDeviceManager = new MediaDeviceManager();
export const peerConnectionManager = new PeerConnectionManager();

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
