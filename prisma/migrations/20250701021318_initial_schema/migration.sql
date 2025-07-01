-- CreateTable
CREATE TABLE "Ink" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "shade" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,
    "stockG" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Ink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mix" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished" BOOLEAN NOT NULL DEFAULT false,
    "swatchHex" TEXT,
    "notes" TEXT,

    CONSTRAINT "Mix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MixComponent" (
    "mixId" INTEGER NOT NULL,
    "inkId" INTEGER NOT NULL,
    "grams" DOUBLE PRECISION NOT NULL,
    "ratio" DOUBLE PRECISION,

    CONSTRAINT "MixComponent_pkey" PRIMARY KEY ("mixId","inkId")
);

-- CreateTable
CREATE TABLE "WeighEvent" (
    "id" SERIAL NOT NULL,
    "mixId" INTEGER NOT NULL,
    "inkId" INTEGER NOT NULL,
    "grams" DOUBLE PRECISION NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeighEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ink_name_key" ON "Ink"("name");

-- AddForeignKey
ALTER TABLE "MixComponent" ADD CONSTRAINT "MixComponent_mixId_fkey" FOREIGN KEY ("mixId") REFERENCES "Mix"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MixComponent" ADD CONSTRAINT "MixComponent_inkId_fkey" FOREIGN KEY ("inkId") REFERENCES "Ink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeighEvent" ADD CONSTRAINT "WeighEvent_mixId_fkey" FOREIGN KEY ("mixId") REFERENCES "Mix"("id") ON DELETE CASCADE ON UPDATE CASCADE;
