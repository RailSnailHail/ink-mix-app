import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// This function UPDATES a specific ink OR RESTORES it
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ink ID' }, { status: 400 });
    }

    // Handle a "restore" request from the history page
    if (body.isDeleted === false) {
      const restoredInk = await prisma.ink.update({ where: { id }, data: { isDeleted: false } });
      return NextResponse.json(restoredInk);
    }

    // Handle a full update
    const stockGNumber = parseFloat(body.stockG);
    if (isNaN(stockGNumber)) {
      return NextResponse.json({ error: 'Stock must be a valid number' }, { status: 400 });
    }

    const updatedInk = await prisma.ink.update({
      where: { id },
      data: {
        name: body.name,
        shade: body.shade,
        colorHex: body.colorHex,
        stockG: stockGNumber,
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

// This function DELETES an ink (soft or permanent)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // This function is already correct and does not need changes.
  try {
    const id = parseInt(params.id, 10);
    const isPermanent = request.nextUrl.searchParams.get('permanent') === 'true';

    if (isPermanent) {
      await prisma.ink.delete({ where: { id } });
    } else {
      await prisma.ink.update({ where: { id }, data: { isDeleted: true } });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("API Error deleting ink:", error);
    return NextResponse.json({ error: 'Failed to delete ink' }, { status: 500 });
  }
}