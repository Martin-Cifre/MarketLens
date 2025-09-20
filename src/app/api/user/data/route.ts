import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch user positions with asset data
    const positions = await db.position.findMany({
      where: { userId },
      include: {
        asset: true
      }
    })

    // Fetch user alerts with asset data
    const alerts = await db.alert.findMany({
      where: { userId },
      include: {
        asset: true
      }
    })

    // Fetch user watches with asset data
    const watches = await db.watch.findMany({
      where: { userId },
      include: {
        asset: true
      }
    })

    // Fetch user recommendations with signal data
    const recommendations = await db.recommendation.findMany({
      where: { userId },
      include: {
        signal: {
          include: {
            asset: true
          }
        }
      }
    })

    return NextResponse.json({
      positions,
      alerts,
      watches,
      recommendations
    })
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}