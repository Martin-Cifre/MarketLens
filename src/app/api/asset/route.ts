import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { symbol, name } = await req.json()

    if (!symbol || !name) {
      return NextResponse.json(
        { error: "Missing required fields: symbol and name" },
        { status: 400 }
      )
    }

    const existingAsset = await db.asset.findUnique({
      where: { symbol: symbol.toUpperCase() }
    })

    if (existingAsset) {
      return NextResponse.json(
        { error: `Asset with symbol ${symbol.toUpperCase()} already exists` },
        { status: 400 }
      )
    }

    const asset = await db.asset.create({
      data: {
        symbol: symbol.toUpperCase(),
        name,
      }
    })

    return NextResponse.json({
      message: "Asset created successfully",
      asset,
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating asset:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const assets = await db.asset.findMany()
    return NextResponse.json(assets, { status: 200 })
  } catch (error) {
    console.error("Error fetching assets:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
