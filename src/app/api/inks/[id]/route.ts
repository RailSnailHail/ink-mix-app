import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();

    // This handles "restore" requests
    if (body.isDeleted === false) {
      const restoredInk = await prisma.ink.update({ where: { id }, data: { isDeleted: false } });
      return NextResponse.json(restoredInk);
    }

    // This handles a full update, now expecting stockG as a number
    if (typeof body.stockG !== 'number') {
       return NextResponse.json({ error: 'Stock must be a number' }, { status: 400 });
    }

    const updatedInk = await prisma.ink.update({
      where: { id },
      data: {
        name: body.name,
        shade: body.shade,
        colorHex: body.colorHex,
        stockG: body.stockG,
      },
    });
    return NextResponse.json(updatedInk);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'An ink with this name already exists.' }, { status: 409 });
    }
    console.error("API Error updating ink:", error);
    return NextResponse.json({ error: 'Failed to update ink' }, { status: 500 });
  }
}

// The DELETE function is unchanged and correct.
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) { /* ... */ }