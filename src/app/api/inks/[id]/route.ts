import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface RouteParams {
  params: { id: string };
}

// This function UPDATES a specific ink
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id, 10);
    const { name, shade, colorHex, stockG } = await request.json();

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ink ID' }, { status: 400 });
    }

    const updatedInk = await prisma.ink.update({
      where: { id },
      data: { name, shade, colorHex, stockG },
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

// This function SOFT-DELETES a specific ink
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ink ID' }, { status: 400 });
    }

    // This performs a soft delete by updating the isDeleted flag
    await prisma.ink.update({
      where: { id },
      data: { isDeleted: true },
    });

    return new NextResponse(null, { status: 204 }); // Success, no content
  } catch (error) {
    console.error("API Error deleting ink:", error);
    return NextResponse.json({ error: 'Failed to delete ink' }, { status: 500 });
  }
}