import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

export function formatRelativeTime(date: string) {
  const d = dayjs(date);
  const now = dayjs();
  const diffSeconds = now.diff(d, 'second');
  const diffDays = now.diff(d, 'day');

  // 미래 시간이거나 1초 미만 차이면 "방금 전"
  if (diffSeconds < 1) {
    return '방금 전';
  }

  if (diffDays < 7) {
    return d.fromNow();
  }

  return d.format('YYYY.MM.DD');
}
