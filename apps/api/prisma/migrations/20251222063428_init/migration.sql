-- CreateTable
CREATE TABLE "Stock" (
    "symbol" TEXT NOT NULL,
    "name" TEXT,
    "assetType" TEXT,
    "description" TEXT,
    "exchange" TEXT,
    "sector" TEXT,
    "industry" TEXT,
    "marketCap" BIGINT,
    "logoUrl" TEXT,
    "overviewFetchedAt" TIMESTAMP(3),

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("symbol")
);

-- CreateTable
CREATE TABLE "DailyPrice" (
    "symbol" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "open" DECIMAL(65,30),
    "high" DECIMAL(65,30),
    "low" DECIMAL(65,30),
    "close" DECIMAL(65,30) NOT NULL,
    "volume" BIGINT NOT NULL,

    CONSTRAINT "DailyPrice_pkey" PRIMARY KEY ("symbol","date")
);

-- CreateIndex
CREATE INDEX "DailyPrice_symbol_date_idx" ON "DailyPrice"("symbol", "date");

-- AddForeignKey
ALTER TABLE "DailyPrice" ADD CONSTRAINT "DailyPrice_symbol_fkey" FOREIGN KEY ("symbol") REFERENCES "Stock"("symbol") ON DELETE CASCADE ON UPDATE CASCADE;
