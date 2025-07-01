import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    // The body now correctly contains stockG as a number from the client
    const { name, shade, colorHex, stockG } = await request.json();

    // Basic validation remains useful as a fallback
    if (!name || !shade || !colorHex || stockG === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newInk = await prisma.ink.create({
      data: { name, shade, colorHex, stockG }, // No parseFloat needed
    });

    return NextResponse.json(newInk, { status: 201 });
  } catch (error) {
    // --- THIS IS THE NEW ERROR HANDLING ---
    // Check if the error is a unique constraint violation (duplicate name)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'An ink with this name already exists.' }, { status: 409 }); // 409 Conflict
    }

    // For all other errors
    console.error("API Error creating ink:", error);
    return NextResponse.json({ error: 'Failed to create ink on the server.' }, { status: 500 });
  }
}

// The GET function does not need any changes.
export async function GET() {
  try {
    const inks = await prisma.ink.findMany({
      orderBy: { shade: 'asc' },
    });
    return NextResponse.json(inks);
  } catch (error) {
    console.error("API Error fetching inks:", error);
    return NextResponse.json({ error: 'Failed to fetch inks' }, { status: 500 });
  }
}