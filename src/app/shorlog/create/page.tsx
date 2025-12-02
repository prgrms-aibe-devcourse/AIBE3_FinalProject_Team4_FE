'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ShorlogCreateModal from "../../components/shorlog/create/steps/ShorlogCreateModal";

function ShorlogCreateContent() {
    const searchParams = useSearchParams();
    const blogId = searchParams.get('blogId') ? Number(searchParams.get('blogId')) : null;

    return <ShorlogCreateModal blogId={blogId} />;
}

export default function ShorlogCreatePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
            <div className="text-sm text-slate-500">로딩 중...</div>
        </div>}>
            <ShorlogCreateContent />
        </Suspense>
    );
}

