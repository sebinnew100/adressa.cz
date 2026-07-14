import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { COOKIE_NAME, getExpectedToken } from '@/lib/auth';
import { SERVICES } from '@/data/services';
import { CITIES } from '@/data/cities';

export const dynamic = 'force-dynamic';

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return token === getExpectedToken();
}

function csvCell(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

const COLUMNS = [
  'fullName', 'email', 'phone', 'service', 'city', 'address',
  'active', 'featured', 'paidUntil', 'subscriptionStatus',
  'salesExempt', 'createdAt',
] as const;

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const providers = await prisma.provider.findMany({
    orderBy: [{ active: 'asc' }, { createdAt: 'desc' }],
  });

  const rows = providers.map(p => [
    p.fullName,
    p.email,
    p.phone,
    SERVICES.find(s => s.id === p.serviceId)?.nameCz ?? p.serviceId,
    CITIES.find(c => c.id === p.cityId)?.nameCz ?? p.cityId,
    p.address,
    p.active ? 'ano' : 'ne',
    p.featured ? 'ano' : 'ne',
    p.paidUntil ? p.paidUntil.toISOString().slice(0, 10) : '',
    p.subscriptionStatus ?? '',
    p.salesExempt ? 'ano' : 'ne',
    p.createdAt.toISOString().slice(0, 10),
  ]);

  const csv = [COLUMNS.join(','), ...rows.map(r => r.map(csvCell).join(','))].join('\n');
  const bom = '﻿'; // so Excel opens UTF-8 (Czech diacritics) correctly

  return new Response(bom + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="poskytovatele-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
