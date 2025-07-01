import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, shade, colorHex, stockG } = body;

    if (!name || !shade || !colorHex || stockG === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // --- THIS IS THE CRITICAL FIX ---
    const stockGNumber = parseFloat(stockG);
    if (isNaN(stockGNumber)) {
      return NextResponse.json({ error: 'Stock must be a valid number' }, { status: 400 });
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
    return NextResponse.json({ error: 'Failed to create ink on the server.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // The GET function is already correct and does not need changes.
  try {
    const inks = await prisma.ink.findMany({
      where: { isDeleted: false },
      orderBy: { shade: 'asc' },
    });
    return NextResponse.json(inks);
  } catch (error) {
    console.error("API Error fetching inks:", error);
    return NextResponse.json({ error: 'Failed to fetch inks' }, { status: 500 });
  }
}