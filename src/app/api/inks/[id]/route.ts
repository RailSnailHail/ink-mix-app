import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// This function UPDATES a specific ink. This is the final, corrected version.
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ink ID' }, { status: 400 });
    }

    const body = await request.json();
    const stockGNumber = parseFloat(body.stockG);
<<<<<<< HEAD
=======

    if (isNaN(stockGNumber)) {
      return NextResponse.json({ error: 'Stock must be a valid number' }, { status: 400 });
    }

>>>>>>> bfd59ee6 (Final code sync for debugging)
    const updatedInk = await prisma.ink.update({
      where: { id: id },
      data: {
        name: body.name,
        shade: body.shade,
        colorHex: body.colorHex,
        stockG: stockGNumber,
      },
    });
    return NextResponse.json(updatedInk);
  } catch (error) {
<<<<<<< HEAD
=======
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'An ink with this name already exists.' }, { status: 409 });
    }
    console.error("API Error updating ink:", error);
>>>>>>> bfd59ee6 (Final code sync for debugging)
    return NextResponse.json({ error: 'Failed to update ink' }, { status: 500 });
  }
}

<<<<<<< HEAD
=======
// This function RESTORES a soft-deleted ink.
>>>>>>> bfd59ee6 (Final code sync for debugging)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ink ID' }, { status: 400 });
    }
    const restoredInk = await prisma.ink.update({
<<<<<<< HEAD
      where: { id },
=======
      where: { id: id },
>>>>>>> bfd59ee6 (Final code sync for debugging)
      data: { isDeleted: false },
    });
    return NextResponse.json(restoredInk);
  } catch (error) {
    console.error("API Error restoring ink:", error);
    return NextResponse.json({ error: 'Failed to restore ink' }, { status: 500 });
  }
}

<<<<<<< HEAD
=======
// This function DELETES an ink (softly or permanently).
>>>>>>> bfd59ee6 (Final code sync for debugging)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ink ID' }, { status: 400 });
    }

    const isPermanent = request.nextUrl.searchParams.get('permanent') === 'true';
    if (isPermanent) {
<<<<<<< HEAD
      await prisma.ink.delete({ where: { id } });
    } else {
      await prisma.ink.update({ where: { id }, data: { isDeleted: true } });
=======
      await prisma.ink.delete({ where: { id: id } });
    } else {
      await prisma.ink.update({
        where: { id: id },
        data: { isDeleted: true },
      });
>>>>>>> bfd59ee6 (Final code sync for debugging)
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ error: 'This ink cannot be deleted because it is used in a saved recipe.' }, { status: 409 });
    }
    console.error("API Error deleting ink:", error);
    return NextResponse.json({ error: 'Failed to delete ink' }, { status: 500 });
  }
}