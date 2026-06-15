import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => new Date().toLocaleDateString("en-CA");
const getServerSnapshot = (): string | undefined => undefined;

/** 서버/클라이언트 타임존 차이로 인한 하이드레이션 불일치를 피하기 위해 마운트 후에만 오늘 날짜를 반환 */
export function useTodayDateString() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
