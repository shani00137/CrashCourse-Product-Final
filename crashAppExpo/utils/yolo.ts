import * as ort from "onnxruntime-react-native";
import { Asset } from "expo-asset";
import { decode } from "jpeg-js";
import { toByteArray } from "base64-js";
import { File, Directory, Paths } from "expo-file-system";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

const modelRef = require("../assets/models/yolov8n.onnx");

export const MODEL_SIZE = 320;

const CONF_THRESHOLD = 0.99;
const MIN_BOX_SIZE = 4;
const IOU_THRESHOLD = 0.45;
const CLASS_COUNT = 80;
const PHONE_CLASS_ID = 67; // COCO: "cell phone"
const ANCHOR_FEATURES = 4 + CLASS_COUNT;

let sessionPromise: Promise<ort.InferenceSession> | null = null;
let sessions: ort.InferenceSession[] = [];

async function loadSession(): Promise<ort.InferenceSession> {
  const asset = Asset.fromModule(modelRef);
  await asset.downloadAsync();
  if (!asset.localUri) {
    throw new Error("Model asset could not be resolved.");
  }
  const file = new File(asset.localUri);
  const buffer = await file.arrayBuffer();
  const session = await ort.InferenceSession.create(buffer, {
    executionProviders: ["cpu"],
    intraOpNumThreads: 2,
    graphOptimizationLevel: "all",
    enableCpuMemArena: false,
    enableMemPattern: false,
  });
  sessions.push(session);
  return session;
}

export function getYoloSession(): Promise<ort.InferenceSession> {
  if (!sessionPromise) {
    sessionPromise = loadSession().catch((e) => {
      sessionPromise = null;
      throw e;
    });
  }
  return sessionPromise;
}

export async function releaseYoloSession(): Promise<void> {
  const pending = sessionPromise;
  sessionPromise = null;
  if (pending) {
    const session = await pending.catch(() => null);
    if (session) {
      await session.release();
    }
  }
  sessions = [];
}

function centerGrayBuffer(): Float32Array {
  const size = MODEL_SIZE * MODEL_SIZE;
  const buf = new Float32Array(3 * size);
  const gray = 114 / 255;
  for (let i = 0; i < buf.length; i++) buf[i] = gray;
  return buf;
}

function letterboxPaste(
  src: Uint8Array,
  srcWidth: number,
  srcHeight: number,
  target: Float32Array
): void {
  const offX = Math.floor((MODEL_SIZE - srcWidth) / 2);
  const offY = Math.floor((MODEL_SIZE - srcHeight) / 2);
  for (let y = 0; y < srcHeight; y++) {
    const ty = offY + y;
    if (ty < 0 || ty >= MODEL_SIZE) continue;
    for (let x = 0; x < srcWidth; x++) {
      const tx = offX + x;
      if (tx < 0 || tx >= MODEL_SIZE) continue;
      const s = (y * srcWidth + x) * 4;
      const t = (ty * MODEL_SIZE + tx) * 3;
      target[t] = src[s] / 255;
      target[t + 1] = src[s + 1] / 255;
      target[t + 2] = src[s + 2] / 255;
    }
  }
}

export async function frameToInput(photoUri: string): Promise<Float32Array> {
  const resized = await manipulateAsync(
    photoUri,
    [{ resize: { height: MODEL_SIZE } }],
    {
      base64: true,
      format: SaveFormat.JPEG,
      compress: 0.7,
    }
  );
  if (!resized.base64) {
    throw new Error("Frame could not be encoded.");
  }
  const bytes = toByteArray(resized.base64);
  const image = decode(bytes, {
    useTArray: true,
    formatAsRGBA: true,
    maxResolutionInMP: 1,
    maxMemoryUsageInMB: 64,
  });
  const target = centerGrayBuffer();
  letterboxPaste(image.data, image.width, image.height, target);
  return target;
}

interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  score: number;
  classId: number;
}

const ANNOTATION_DIR = "proctor_annotations";

function drawRect(
  data: Uint8Array,
  width: number,
  color: [number, number, number],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  thickness: number
): void {
  const minX = Math.max(0, Math.floor(x0));
  const minY = Math.max(0, Math.floor(y0));
  const maxX = Math.min(width - 1, Math.ceil(x1));
  const maxY = Math.min(Math.floor(data.length / 4 / width) - 1, Math.ceil(y1));
  const filled = thickness <= 0;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const isBorder =
        filled ||
        x < minX + thickness ||
        x >= maxX - thickness ||
        y < minY + thickness ||
        y >= maxY - thickness;
      if (!isBorder) continue;
      const i = (y * width + x) * 4;
      data[i] = color[0];
      data[i + 1] = color[1];
      data[i + 2] = color[2];
    }
  }
}

function putText(
  data: Uint8Array,
  width: number,
  text: string,
  x: number,
  y: number,
  color: [number, number, number]
): void {
  const fontW = 5;
  const fontH = 7;
  for (let cx = 0; cx < text.length; cx++) {
    const chW = text[cx] === "." ? 2 : fontW;
    const nx = Math.round(x + cx * fontW);
    const ny = Math.round(y);
    for (let py = 0; py < fontH; py++) {
      for (let px = 0; px < chW; px++) {
        const i = (ny + py) * width + (nx + px);
        if (i >= 0 && i < data.length / 4) {
          data[i * 4] = color[0];
          data[i * 4 + 1] = color[1];
          data[i * 4 + 2] = color[2];
        }
      }
    }
  }
}

export async function frameAnalysis(
  photoUri: string
): Promise<{ phoneDetected: boolean; detections: Box[]; annotatedPath: string | null }> {
  const session = await getYoloSession();
  const input = await frameToInput(photoUri);
  const feeds: Record<string, ort.Tensor> = {
    [session.inputNames[0]]: new ort.Tensor("float32", input, [
      1,
      3,
      MODEL_SIZE,
      MODEL_SIZE,
    ]),
  };
  const results = await session.run(feeds);
  const output = results[session.outputNames[0]] as ort.Tensor;
  const data = output.data as Float32Array;
  const detections = extractPhoneDetections(data);
  const annotatedPath = await saveAnnotatedFrame(photoUri, detections);

  if (detections.length === 0) {
    console.log(
      `[yolo] frameContainsPhone=false (no valid phone >=99% after NMS)${annotatedPath ? ` annotated=${annotatedPath}` : ""}`
    );
  } else {
    console.log(
      `[yolo] frameContainsPhone=true (${detections.length} phone detection(s) after NMS, top=${(detections[0].score * 100).toFixed(1)}%)${annotatedPath ? ` annotated=${annotatedPath}` : ""}`
    );
  }

  return {
    phoneDetected: detections.length > 0,
    detections,
    annotatedPath,
  };
}

async function saveAnnotatedFrame(
  photoUri: string,
  detections: Box[]
): Promise<string | null> {
  try {
    const resized = await manipulateAsync(
      photoUri,
      [{ resize: { height: MODEL_SIZE } }],
      { base64: true, format: SaveFormat.JPEG, compress: 0.7 }
    );
    if (!resized.base64) {
      throw new Error("Frame could not be encoded.");
    }
    const image = decode(toByteArray(resized.base64), {
      useTArray: true,
      formatAsRGBA: true,
      maxResolutionInMP: 1,
      maxMemoryUsageInMB: 64,
    });

    const scale = image.width / MODEL_SIZE;
    const data = image.data.slice();
    for (const d of detections) {
      drawRect(
        data,
        image.width,
        [255, 0, 0],
        d.x1 * scale,
        d.y1 * scale,
        d.x2 * scale,
        d.y2 * scale,
        2
      );
      const label = `PHONE ${(d.score * 100).toFixed(0)}%`;
      putText(
        data,
        image.width,
        label,
        d.x1 * scale,
        Math.max(0, d.y1 * scale - 10),
        [255, 0, 0]
      );
    }

    const png = encodePng(data, image.width, image.height);
    const dir = new File(Paths.cache, ANNOTATION_DIR);
    if (!dir.exists) {
      new Directory(Paths.cache, ANNOTATION_DIR).create({
        idempotent: true,
        intermediates: true,
      });
    }
    const out = new File(dir, `proctor_${Date.now()}.png`);
    out.write(png);
    return out.uri;
  } catch (e) {
    if (__DEV__) console.log("[yolo] annotation save failed:", String(e));
    return null;
  }
}

function encodePng(rgba: Uint8Array, width: number, height: number): Uint8Array {
  const crcTable = (() => {
    const t = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })();

  const out: number[] = [];
  const push = (n: number) => out.push(n & 0xff);
  const push32 = (n: number) => {
    push(n >>> 24);
    push(n >>> 16);
    push(n >>> 8);
    push(n);
  };
  const chunk = (type: string, body: number[]) => {
    push32(body.length);
    const typeBytes = [
      type.charCodeAt(0),
      type.charCodeAt(1),
      type.charCodeAt(2),
      type.charCodeAt(3),
    ];
    let crc = 0xffffffff;
    for (const b of typeBytes) {
      push(b);
      crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8);
    }
    for (const b of body) {
      push(b);
      crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8);
    }
    push32((crc ^ 0xffffffff) >>> 0);
  };

  out.push(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  chunk("IHDR", [
    (width >>> 24) & 0xff,
    (width >>> 16) & 0xff,
    (width >>> 8) & 0xff,
    width & 0xff,
    (height >>> 24) & 0xff,
    (height >>> 16) & 0xff,
    (height >>> 8) & 0xff,
    height & 0xff,
    8,
    2,
    0,
    0,
    0,
  ]);

  const len = width * height * 3 + height;
  const raw = new Uint8Array(len);
  let p = 0;
  for (let y = 0; y < height; y++) {
    raw[p++] = 0;
    const rowStart = y * width * 4;
    for (let x = 0; x < width; x++) {
      const i = rowStart + x * 4;
      raw[p++] = rgba[i];
      raw[p++] = rgba[i + 1];
      raw[p++] = rgba[i + 2];
    }
  }

  const R: number[] = [];
  const b8 = (v: number) => R.push(v & 0xff);
  const b16 = (v: number) => {
    b8(v & 0xff);
    b8((v >>> 8) & 0xff);
  };
  b8(0x78);
  b8(0x01);
  const BLOCK = 0x8000;
  for (let start = 0; start < len; start += BLOCK) {
    const last = start + BLOCK >= len;
    const blockLen = last ? len - start : BLOCK;
    b8(last ? 0x01 : 0x00);
    b16(blockLen);
    b16(~blockLen & 0xffff);
    for (let j = 0; j < blockLen; j++) b8(raw[start + j]);
  }

  let s1 = 1;
  let s2 = 0;
  for (let i = 0; i < len; i++) {
    s1 = (s1 + raw[i]) % 65521;
    s2 = (s2 + s1) % 65521;
  }
  b8((s2 >>> 8) & 0xff);
  b8(s2 & 0xff);
  b8((s1 >>> 8) & 0xff);
  b8(s1 & 0xff);

  chunk("IDAT", R);
  chunk("IEND", []);
  return Uint8Array.from(out);
}

export async function frameContainsPhone(photoUri: string): Promise<boolean> {
  const { phoneDetected } = await frameAnalysis(photoUri);
  return phoneDetected;
}

function nms(boxes: Box[]): Box[] {
  const sorted = [...boxes].sort((a, b) => b.score - a.score);
  const keep: Box[] = [];
  for (const box of sorted) {
    let suppressed = false;
    for (const kept of keep) {
      const ix = Math.max(
        0,
        Math.min(box.x2, kept.x2) - Math.max(box.x1, kept.x1)
      );
      const iy = Math.max(
        0,
        Math.min(box.y2, kept.y2) - Math.max(box.y1, kept.y1)
      );
      const inter = ix * iy;
      const areaBox = (box.x2 - box.x1) * (box.y2 - box.y1);
      const areaKept = (kept.x2 - kept.x1) * (kept.y2 - kept.y1);
      const iou = inter / (areaBox + areaKept - inter);
      if (iou > IOU_THRESHOLD) {
        suppressed = true;
        break;
      }
    }
    if (!suppressed) keep.push(box);
  }
  return keep;
}

export function extractPhoneDetections(output: Float32Array, inputSize = MODEL_SIZE): Box[] {
  const anchorCount = output.length / ANCHOR_FEATURES;
  const boxes: Box[] = [];
  let phoneBelowThreshold = 0;
  let bestPhoneBelow = 0;
  const scores = new Float32Array(CLASS_COUNT);
  for (let a = 0; a < anchorCount; a++) {
    const base = a * ANCHOR_FEATURES;
    let bestClass = 0;
    let bestScore = 0;
    let secondClass = -1;
    let secondScore = 0;
    for (let c = 0; c < CLASS_COUNT; c++) {
      const s = 1 / (1 + Math.exp(-output[base + 4 + c]));
      scores[c] = s;
      if (s > bestScore) {
        secondClass = bestClass;
        secondScore = bestScore;
        bestScore = s;
        bestClass = c;
      } else if (s > secondScore) {
        secondScore = s;
        secondClass = c;
      }
    }

    if (bestClass === PHONE_CLASS_ID) {
      const cx = output[base];
      const cy = output[base + 1];
      const w = output[base + 2];
      const h = output[base + 3];
      const validBox =
        w >= MIN_BOX_SIZE && h >= MIN_BOX_SIZE && cx > 0 && cy > 0;
      const clearlyWinning = bestScore - secondScore >= 0.05;
      const rejected = !validBox || !clearlyWinning;
      if (bestScore >= CONF_THRESHOLD) {
        if (rejected) {
          console.log(
            `[yolo] anchor #${a} phone~100% but rejected (${
              !validBox
                ? `degenerate box cx=${cx.toFixed(2)} cy=${cy.toFixed(2)} w=${w.toFixed(2)} h=${h.toFixed(2)}`
                : `ambiguous tie with class ${secondClass} ${(secondScore * 100).toFixed(1)}%`
            })`
          );
        } else {
          console.log(
            `[yolo] PHONE prediction at anchor #${a} confidence=${(bestScore * 100).toFixed(1)}%` +
              ` cx=${cx.toFixed(3)} cy=${cy.toFixed(3)} w=${w.toFixed(3)} h=${h.toFixed(3)}` +
              ` runnerUp class ${secondClass} ${(secondScore * 100).toFixed(1)}%`
          );
          boxes.push({
            x1: cx - w / 2,
            y1: cy - h / 2,
            x2: cx + w / 2,
            y2: cy + h / 2,
            score: bestScore,
            classId: bestClass,
          });
        }
      } else {
        phoneBelowThreshold++;
        if (bestScore > bestPhoneBelow) bestPhoneBelow = bestScore;
      }
    }
  }
  if (phoneBelowThreshold > 0) {
    console.log(
      `[yolo] ${phoneBelowThreshold} anchor(s) favored phone but <99% (highest ${(bestPhoneBelow * 100).toFixed(1)}%) - ignored`
    );
  }
  return nms(boxes);
}