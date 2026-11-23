import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
          borderRadius: "110px",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 190, fontWeight: 900, lineHeight: 1 }}>D</div>
        <div
          style={{
            fontSize: 54,
            fontWeight: 800,
            letterSpacing: "4px",
            marginTop: 8,
          }}
        >
          DJASSA
        </div>
      </div>
    ),
    { ...size }
  );
}
