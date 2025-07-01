import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const showDeleted = searchParams.get('deleted') === 'true';
    const inStockOnly = searchParams.get('inStock') === 'true';

    let whereClause: any = { isDeleted: showDeleted };
    if (inStockOnly) {
      whereClause.stockG = { gt: 0 };
    }

    const inks = await prisma.ink.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(inks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inks.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, shade, colorHex, stockG } = body;
    const stockGNumber = parseFloat(stockG);
    const newInk = await prisma.ink.create({
      data: { name, shade, colorHex, stockG: stockGNumber },
    });
    return NextResponse.json(newInk, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ink.' }, { status: 500 });
  }
}