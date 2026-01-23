import { NextResponse } from "next/server"
import QRCode from "qrcode"

export const dynamic = "force-dynamic"

export async function GET(req: Request, { params }: { params: Promise<{ label: string }> }) {
  const { label: rawLabel } = await params
  const label = rawLabel?.toUpperCase()
  if (!label) return NextResponse.json({ error: "Missing label" }, { status: 400 })

  // Build absolute URL for the vote page using forwarded headers (x-forwarded-host, host)
  // to support proxies, load balancers, and proper external URLs
  const url = new URL(req.url)
  const headers = req.headers
  const forwardedHost = headers.get("x-forwarded-host")
  const forwardedProto = headers.get("x-forwarded-proto")
  const host = forwardedHost || headers.get("host") || url.host
  const protocol = forwardedProto || url.protocol.replace(":", "")
  
  const origin = `${protocol}://${host}`
  const voteUrl = `${origin}/vote/${label}`

  try {
    const buffer = await QRCode.toBuffer(voteUrl, {
      type: "png",
      margin: 1,
      width: 512,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })

    // Wrap Buffer in a Blob for Response body (use Uint8Array view)
    const blob = new Blob([new Uint8Array(buffer)], { type: "image/png" })
    return new Response(blob, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, immutable",
      },
    })
  } catch (err) {
    console.error("QR code generation error:", err)
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 })
  }
}
