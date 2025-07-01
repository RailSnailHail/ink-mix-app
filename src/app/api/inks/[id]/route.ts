import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const stockGNumber = parseFloat(body.stockG);
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
    return NextResponse.json({ error: 'Failed to update ink' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const restoredInk = await prisma.ink.update({
      where: { id },
      data: { isDeleted: false },
    });
    return NextResponse.json(restoredInk);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to restore ink' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const isPermanent = request.nextUrl.searchParams.get('permanent') === 'true';
    if (isPermanent) {
      await prisma.ink.delete({ where: { id } });
    } else {
      await prisma.ink.update({ where: { id }, data: { isDeleted: true } });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ error: 'This ink cannot be deleted because it is used in a saved recipe.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to delete ink' }, { status: 500 });
  }
}