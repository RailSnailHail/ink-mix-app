import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

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
    console.error("API Error fetching inks:", error);
    return NextResponse.json({ error: 'Failed to fetch inks.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, shade, colorHex, stockG } = body;
    const stockGNumber = parseFloat(stockG);

    if (!name || !shade || !colorHex || isNaN(stockGNumber)) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    const newInk = await prisma.ink.create({
      data: { name, shade, colorHex, stockG: stockGNumber },
    });

    return NextResponse.json(newInk, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'An ink with this name already exists.' }, { status: 409 });
    }
    console.error("API Error creating ink:", error);
    return NextResponse.json({ error: 'Failed to create ink.' }, { status: 500 });
  }
}