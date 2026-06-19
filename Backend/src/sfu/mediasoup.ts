import mediasoup, {
  types as mediasoupTypes,
} from "mediasoup";

export type RouterId = string;

type TransportPair = {
  producerTransport: mediasoupTypes.Transport;
  consumerTransport: mediasoupTypes.Transport;
};

export class MediasoupManager {
  private worker: mediasoupTypes.Worker | null = null;
  private routers = new Map<RouterId, mediasoupTypes.Router>();

  async initWorker(): Promise<mediasoupTypes.Worker> {
    if (this.worker) return this.worker;

    // Production-grade: configure worker with env-based ports/CPU constraints if needed.
    this.worker = await mediasoup.createWorker({
      rtcMaxPort: 50000,
      rtcMinPort: 40000,
      logLevel: "warn",
      logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
      // mediasoup supports advanced settings for real deployments; keep defaults for now.
    });

    this.worker.on("died", () => {
      this.worker = null;
      this.routers.clear();
    });

    return this.worker;
  }

  async getOrCreateRouter(routerId: RouterId): Promise<mediasoupTypes.Router> {
    const existing = this.routers.get(routerId);
    if (existing) return existing;

    const worker = await this.initWorker();

    const router = await worker.createRouter({
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
          parameters: {
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/VP9",
          clockRate: 90000,
          parameters: {},
        },
      ],
    });

    this.routers.set(routerId, router);
    return router;
  }

  getRouter(routerId: RouterId): mediasoupTypes.Router | undefined {
    return this.routers.get(routerId);
  }

  async closeRouter(routerId: RouterId): Promise<void> {
    const r = this.routers.get(routerId);
    if (!r) return;
    // Router close is not directly exposed in older versions; consumers/transports will be GC'd.
    this.routers.delete(routerId);
  }
}

export const mediasoupManager = new MediasoupManager();
