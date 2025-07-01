import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  try {
    // Now correctly expects stockG to be a number
    const { name, shade, colorHex, stockG } = await request.json();

    if (typeof stockG !== 'number') {
       return NextResponse.json({ error: 'Stock must be a number' }, { status: 400 });
    }

    const newInk = await prisma.ink.create({
      data: { name, shade, colorHex, stockG },
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
  try {
    const inks = await prisma.ink.findMany({ where: { isDeleted: false }, orderBy: { shade: 'asc' } });
    return NextResponse.json(inks);
  } catch (error) {
    console.error("API Error fetching inks:", error);
    return NextResponse.json({ error: 'Failed to fetch inks' }, { status: 500 });
  }
}