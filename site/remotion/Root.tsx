import { Composition } from "remotion";
import { DEMO_FPS, DEMO_FRAMES, DEMO_H, DEMO_W, SpanixDemo } from "../src/components/demo/spanix-demo";

/* A mesma composição que o <Player /> usa na página. Um arquivo, dois
   destinos: preview ao vivo no site e MP4 pelo `npm run film`. */
export const RemotionRoot: React.FC = () => (
  <Composition
    id="SpanixDemo"
    component={SpanixDemo}
    durationInFrames={DEMO_FRAMES}
    fps={DEMO_FPS}
    width={DEMO_W}
    height={DEMO_H}
  />
);
