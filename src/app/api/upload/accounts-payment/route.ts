import { NextRequest, NextResponse } from "next/server";
import { validateUserRequest } from "@/src/shared/utils/validate";
import { parse } from "csv-parse";
import { prisma } from "@/src/shared/config/db";

const getValue = (record: Record<string, string>, keys: string[]): string | null => {
  for (const key of keys) {
    const value = record[key]?.trim();
    if (value && value !== "-" && value !== "") {
      return value;
    }
  }
  return null;
};

const parseCurrency = (value: string | null): number => {
  if (!value) return 0;

  let cleaned = value
    .replace(/R\$\s*/gi, "")
    .replace(/\s+/g, "")
    .trim();

  if (cleaned.includes(".") && cleaned.includes(",")) {
    const lastDot = cleaned.lastIndexOf(".");
    const lastComma = cleaned.lastIndexOf(",");
    cleaned =
      lastComma > lastDot
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
  } else {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  }

  return Number.isFinite(Number(cleaned)) ? Number(cleaned) : 0;
};

const parseDate = (value: string | null): Date | null => {
  if (!value || value === "-" || value === "") return null;

  if (value.includes("/")) {
    const [day, month, year] = value.split("/").map(Number);
    if (day && month && year) {
      const date = new Date(year, month - 1, day);
      return isNaN(date.getTime()) ? null : date;
    }
  }

  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

const parseCSV = async (csvText: string): Promise<Record<string, string>[]> => {
  return new Promise((resolve, reject) => {
    parse(
      csvText,
      {
        delimiter: csvText.includes(";") ? ";" : ",",
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true,
      },
      (err, output) => {
        if (err) reject(err);
        else resolve(output as Record<string, string>[]);
      }
    );
  });
};

/* ============================================================
 * Mapper
 * ============================================================
 */

const mapRecordToAccountPayable = (
  record: Record<string, string>,
  workerSpaceId: string
) => {
  const maturity = getValue(record, ["VENCIMENTO", "vencimento"]);
  const launchDate = getValue(record, ["LANÇAMENTO", "data_lancamento"]);
  const paidDate = getValue(record, ["PAGO", "data_pagamento"]);

  const valueStr = getValue(record, ["VALOR", "valor"]);
  const valueTotalStr =
    getValue(record, ["VALOR TOTAL NF", "valor_total"]) || valueStr;

  const valueAmount = parseCurrency(valueStr);
  const valueTotal = parseCurrency(valueTotalStr);

  const maturityDate = parseDate(maturity);
  if (!maturityDate || valueAmount <= 0) return null;

  const statusRaw = getValue(record, ["STATUS", "status"]) ?? "PENDING";
  const status =
    statusRaw.toUpperCase().includes("PAGO") || statusRaw.toUpperCase() === "PAID"
      ? "PAID"
      : "PENDING";

  const installmentsRaw = getValue(record, ["PARCELA", "installments"]);
  const installments = installmentsRaw ? Number(installmentsRaw) : undefined;

  return {
    nf: getValue(record, ["NF", "nf"]) ?? undefined,
    issuer: parseDate(getValue(record, ["EMISSÃO"])) ?? undefined,
    supplier: getValue(record, ["FORNECEDOR / FAVORECIDO", "FORNECEDOR"]) ?? undefined,
    product_and_services:
      getValue(record, ["PRODUTO / SERVIÇO"]) ?? undefined,
    construction_cost: getValue(record, ["CUSTO OBRA"]) ?? undefined,
    formPayment: getValue(record, ["FORMA DE PG"]) ?? undefined,
    valueAmount,
    valueTotal,
    installments,
    maturity: maturityDate,
    launchDate: parseDate(launchDate) ?? new Date(),
    paidDate: parseDate(paidDate),
    status,
    workerSpaceId,
  };
};

/* ============================================================
 * Route
 * ============================================================
 */

export async function POST(request: NextRequest) {
  try {
    const userResult = await validateUserRequest(request);
    if (userResult instanceof NextResponse) return userResult;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      return NextResponse.json(
        { error: "Apenas arquivos CSV são permitidos" },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    const records = await parseCSV(csvText);

    const mappedRecords = records
      .map((record) =>
        mapRecordToAccountPayable(record, userResult.workerSpaceId)
      )
      .filter(Boolean);

    if (mappedRecords.length === 0) {
      return NextResponse.json(
        { error: "Nenhum registro válido encontrado" },
        { status: 400 }
      );
    }

    await prisma.accountsPayable.createMany({
      data: mappedRecords.filter(Boolean) as any,
    });

    return NextResponse.json({
      success: true,
      totalRows: records.length,
      inserted: mappedRecords.length,
    });
  } catch (error) {
    console.error("Erro crítico na API de CSV:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar arquivo" },
      { status: 500 }
    );
  }
}