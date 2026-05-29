import type { CountryPin } from "@/lib/countryPins";

export function createPinElement(pin: CountryPin, onPinClick: (p: CountryPin) => void): HTMLElement {
  const isAllAchieved = pin.count > 0 && pin.achievedCount === pin.count;
  const id = `pin-${pin.countryCode}`;

  // 우선순위: 마감 초과 → 전달성 → 미달성
  type PinState = "expired" | "achieved" | "pending";
  const state: PinState = pin.hasExpiredDeadline ? "expired"
    : isAllAchieved ? "achieved"
    : "pending";

  const colors = {
    achieved: { bodyLight: "#fcd34d", bodyDark: "#92400e", innerLight: "#fde68a", innerDark: "#d97706" },
    expired:  { bodyLight: "#ff7d8e", bodyDark: "#b5002a", innerLight: "#ffaab5", innerDark: "#e62040" },
    pending:  { bodyLight: "#e0e0e0", bodyDark: "#7f7f7f", innerLight: "#c8c8c8", innerDark: "#8c8c8c" },
  }[state];

  const glow = state === "achieved"
    ? "drop-shadow(0 0 7px rgba(251,191,36,0.8)) drop-shadow(0 3px 6px rgba(0,0,0,0.5))"
    : "drop-shadow(0 3px 6px rgba(0,0,0,0.5))";

  const fontSize = pin.count >= 10 ? 10.5 : 13;

  // CSS2DRenderer가 transform을 매 프레임 직접 덮어쓰므로, 외부 컨테이너에는
  // transition을 두지 않는다. zoom 스케일은 scaleWrapper, hover 애니메이션은 inner에서 처리.
  const el = document.createElement("div");
  el.style.cssText = [
    "width:28px",
    "height:40px",
    "margin-top:-20px",  // 꼬리 끝이 좌표를 가리키도록 위로 오프셋
    "user-select:none",
    "pointer-events:all",
  ].join(";");

  // zoom 스케일 전용 래퍼 — CSS2DRenderer가 el.transform을 덮어쓰므로 한 단계 아래에 위치
  const scaleWrapper = document.createElement("div");
  scaleWrapper.className = "pin-scale-wrapper";
  scaleWrapper.style.cssText = [
    "width:100%",
    "height:100%",
    "transform-origin:center bottom",
    "transition:transform 0.2s ease-out",
  ].join(";");

  const inner = document.createElement("div");
  inner.style.cssText = [
    "width:100%",
    "height:100%",
    "cursor:pointer",
    "transition:transform 0.15s cubic-bezier(0.16,1,0.3,1)",
    "transform-origin:center bottom",
    `filter:${glow}`,
  ].join(";");

  inner.innerHTML = `
    <svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="${id}-body" cx="38%" cy="28%" r="72%">
          <stop offset="0%" stop-color="${colors.bodyLight}"/>
          <stop offset="100%" stop-color="${colors.bodyDark}"/>
        </radialGradient>
        <radialGradient id="${id}-inner" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stop-color="${colors.innerLight}"/>
          <stop offset="100%" stop-color="${colors.innerDark}"/>
        </radialGradient>
      </defs>
      <path d="M14,1 C6.82,1 1,6.82 1,14 C1,22.73 14,39 14,39 C14,39 27,22.73 27,14 C27,6.82 21.18,1 14,1 Z"
            fill="url(#${id}-body)"
            stroke="rgba(255,255,255,0.12)"
            stroke-width="0.8"/>
      <circle cx="14" cy="13" r="8.5" fill="url(#${id}-inner)"/>
      <text x="14" y="13"
            text-anchor="middle"
            dominant-baseline="central"
            fill="#ffffff"
            font-size="${fontSize}"
            font-weight="500"
            font-family="-apple-system,BlinkMacSystemFont,sans-serif">
        ${pin.count}
      </text>
    </svg>
  `;

  el.onmouseenter = () => { inner.style.transform = "scale(1.2)"; };
  el.onmouseleave = () => { inner.style.transform = ""; };
  el.onclick = (e) => {
    e.stopPropagation();
    onPinClick(pin);
  };

  scaleWrapper.appendChild(inner);
  el.appendChild(scaleWrapper);
  return el;
}
