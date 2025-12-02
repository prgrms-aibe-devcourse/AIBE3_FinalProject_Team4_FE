import { fetchAiGenerate } from '@/src/api/aiApi';
import { useState } from 'react';
import type {
  AiContentType,
  AiGenerateMode,
  AiGenerateMultiResults,
  AiGenerateRequest,
  AiGenerateSummaryResult,
} from '../../../../types/ai';
import AIButton from './AIButton';

interface AiGenerateProps {
  mode: AiGenerateMode;
  contentType: AiContentType;
  content: string;
  message?: string;
  onGenerate: (result: string[]) => void;
}

export default function AiGenerate({
  mode,
  contentType,
  content,
  message,
  onGenerate,
}: AiGenerateProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiClick = async () => {
    setIsAiLoading(true);
    try {
      const req: AiGenerateRequest = {
        mode,
        contentType,
        content,
        message,
      };

      const res = await fetchAiGenerate(req);

      // summary는 result(string), 나머지는 results(string[])
      if ('results' in res.data) {
        onGenerate((res.data as AiGenerateMultiResults).results);
      } else if ('result' in res.data) {
        onGenerate([(res.data as AiGenerateSummaryResult).result]);
      } else {
        onGenerate([]);
      }
    } catch (e) {
      onGenerate([]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return <AIButton onClick={handleAiClick} isLoading={isAiLoading} />;
}
