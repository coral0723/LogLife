---
name: avoid-ralph-skill
description: 사용자는 OMC Ralph 스킬(self-referential loop) 사용 안 함 — 토큰 비용 우려
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 2b0c00c4-1914-4681-9c57-13cb82964f4a
---

OMC `ralph` 스킬은 추천·실행하지 말 것. Ruby 미설치 경고도 무시 가능.

**Why:** 사용자가 토큰 사용량 우려로 명시적 거부함. Ralph는 verification 통과까지 같은 작업을 self-loop으로 반복하는 구조라 토큰 소비가 큼. [[loglife_cost_constraint]]의 비용 0원 원칙과도 결이 맞음.

**How to apply:**
- OMC 스킬 추천/라우팅 시 ralph, ralplan은 제외
- `/oh-my-claudecode:omc-doctor`가 Ruby missing을 WARN으로 표시해도 무시
- 반복 작업이 필요할 땐 ultrawork, ultraqa, team 같은 다른 OMC 스킬이나 그냥 todoWrite로 처리
