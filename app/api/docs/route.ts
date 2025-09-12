import type { NextRequest } from "next/server"
import { swaggerConfig } from "@/lib/swagger-config"

export async function GET(req: NextRequest) {
  return Response.json(swaggerConfig, {
    headers: {
      "Content-Type": "application/json",
    },
  })
}
