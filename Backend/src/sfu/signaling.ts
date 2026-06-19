import type { types as mediasoupTypes } from "mediasoup";
import type { RouterId } from "./mediasoup.js";
import { mediasoupManager } from "./mediasoup.js";

export type SFUCreateTransportResponse = {

  transportId: string;
  iceParameters: mediasoupTypes.IceParameters;
  iceCandidates: mediasoupTypes.IceCandidate[];
  dtlsParameters: mediasoupTypes.DtlsParameters;
};

export type SFUConsumeResponse = {
  consumerId: string;
  producerId: string;
  kind: mediasoupTypes.MediaKind;
  rtpParameters: mediasoupTypes.RtpParameters;
  type: mediasoupTypes.Consumer["type"];
  producerPaused?: boolean;
};

type ProducerKey = string; // `${routerId}:${producerId}`

type RoomState = {
  producers: Map<string, mediasoupTypes.Producer>; // producerId -> producer
  consumers: Map<string, mediasoupTypes.Consumer>; // consumerId -> consumer
};

const roomState = new Map<RouterId, RoomState>();

function getOrInitRoomState(routerId: RouterId): RoomState {
  const existing = roomState.get(routerId);
  if (existing) return existing;
  const s: RoomState = { producers: new Map(), consumers: new Map() };
  roomState.set(routerId, s);
  return s;
}

export function getMediasoupRouter(routerId: RouterId) {
  return mediasoupManager.getRouter(routerId);
}

export async function ensureRouter(routerId: RouterId) {
  return mediasoupManager.getOrCreateRouter(routerId);
}

export async function createProducerTransport(
  routerId: RouterId,
  transportOptions: mediasoupTypes.WebRtcTransportOptions,
): Promise<SFUCreateTransportResponse & { transport: mediasoupTypes.Transport }> {

  const router = await ensureRouter(routerId);
  const transport = await router.createWebRtcTransport(transportOptions);

  // mediasoup transport event hooks can be attached here for production-level monitoring.
  return {
    transportId: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters,
    transport,
  };
}

export async function connectTransport(
  transport: mediasoupTypes.Transport,
  dtlsParameters: mediasoupTypes.DtlsParameters,
): Promise<void> {
  await transport.connect({ dtlsParameters });
}

export async function createConsumerTransport(
  routerId: RouterId,
  transportOptions: mediasoupTypes.WebRtcTransportOptions,
): Promise<SFUCreateTransportResponse & { transport: mediasoupTypes.Transport }> {

  const router = await ensureRouter(routerId);
  const transport = await router.createWebRtcTransport(transportOptions);
  return {
    transportId: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters,
    transport,
  };
}

export async function registerProducer(
  routerId: RouterId,
  producer: mediasoupTypes.Producer,
): Promise<void> {
  const s = getOrInitRoomState(routerId);
  s.producers.set(producer.id, producer);
}

export async function createConsumerForProducer(
  routerId: RouterId,
  consumerTransport: mediasoupTypes.Transport,
  producerId: string,
  rtpCapabilities: mediasoupTypes.RtpCapabilities,
): Promise<SFUConsumeResponse & { consumer: mediasoupTypes.Consumer }> {
  const router = await ensureRouter(routerId);
  const s = getOrInitRoomState(routerId);

  const producer = s.producers.get(producerId);
  if (!producer) throw new Error("Producer not found");

  if (!router.canConsume({ producerId, rtpCapabilities })) {
    throw new Error("Cannot consume with provided RTP capabilities");
  }

  const consumer = await consumerTransport.consume({
    producerId,
    rtpCapabilities,
    paused: false,
  });

  s.consumers.set(consumer.id, consumer);

  const resp: SFUConsumeResponse = {
    consumerId: consumer.id,
    producerId: producer.id,
    kind: consumer.kind,
    rtpParameters: consumer.rtpParameters,
    type: consumer.type,
    producerPaused: consumer.producerPaused,
  };

  // Production behavior: handle consumer transport/producer closure events.
  consumer.on("transportclose", () => {
    s.consumers.delete(consumer.id);
  });
  // mediasoup Producer event handler typings differ by version; rely on transportclose cleanup.


  return { ...resp, consumer };
}

export function listProducers(routerId: RouterId): Array<{ producerId: string; kind: mediasoupTypes.MediaKind }> {
  const s = getOrInitRoomState(routerId);
  return Array.from(s.producers.values()).map((p) => ({
    producerId: p.id,
    kind: p.kind,
  }));
}
