import { NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';

export async function POST() {
    try {
        await d1Query('ALTER TABLE products ADD COLUMN code INTEGER');
        return NextResponse.json({ success: true, message: 'Migration complete' });
    } catch (err) {
        // Column may already exist — not an error
        return NextResponse.json({ success: true, message: String(err) });
    }
}
