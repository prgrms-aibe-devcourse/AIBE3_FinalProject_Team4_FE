'use client';

import { useSearchParams } from 'next/navigation';
import ShorlogCreateModal from "../../components/shorlog/create/steps/ShorlogCreateModal";

export default function ShorlogCreatePage() {
    const searchParams = useSearchParams();
    const blogId = searchParams.get('blogId') ? Number(searchParams.get('blogId')) : null;

    return <ShorlogCreateModal blogId={blogId} />;
}
