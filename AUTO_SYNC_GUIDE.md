# 🤖 자동 동기화 가이드

API 키 없이 완전 무료로 자동 카드 생성!

## 🎯 작동 원리

```
1. Python 스크립트가 cards.json 감시
2. Claude Code에서 /vocab-card 실행
3. cards.json 자동 업데이트
4. 브라우저 새로고침 → 새 카드 표시!
```

---

## 📦 설치

### 1. Python 패키지 설치
```bash
cd vocabulary-cards-
pip install -r requirements.txt
```

---

## 🚀 사용 방법

### 1단계: Python 감시 스크립트 실행
```bash
python watcher.py
```

출력:
```
==================================================
🤖 Vocabulary Cards Auto-Sync 시작!
==================================================
📁 감시 중: C:\Users\...\cards.json
💡 사용법:
   1. Claude Code에서 /vocab-card [단어] 실행
   2. cards.json이 자동으로 업데이트됨
   3. 브라우저 새로고침!
==================================================

📚 현재 카드 개수: 0개
```

### 2단계: 브라우저에서 사이트 열기
```
https://seungjin-yoo88.github.io/vocabulary-cards-/
```

### 3단계: Claude Code에서 단어 생성
```
/vocab-card unprecedented
```

### 4단계: 자동 감지!
Python 스크립트 출력:
```
✨ 새 카드 감지! (+1개)
📊 총 카드: 0개 → 1개
📝 최신 카드: unprecedented
🔄 브라우저를 새로고침하세요!
```

### 5단계: 브라우저 새로고침
`Ctrl + R` 또는 `F5` → 새 카드 표시됨! 🎉

---

## 💡 사용 팁

### ⚡ 빠른 워크플로우
1. **터미널 1**: `python watcher.py` 실행 (계속 켜둠)
2. **터미널 2**: Claude Code 세션
3. **브라우저**: vocabulary-cards 사이트

### 🔄 반복 작업
```bash
# Claude Code에서
/vocab-card 단어1
/vocab-card 단어2
/vocab-card 단어3

# 브라우저에서 새로고침만 하면 모두 표시됨!
```

### 📊 실시간 모니터링
Python 스크립트가 실시간으로 알려줌:
- 새 카드 추가 감지
- 카드 개수 변화
- 최신 카드 정보

---

## 🎁 장점

✅ **완전 무료** - API 키 불필요
✅ **고품질** - Claude 4인 전문가 협업
✅ **빠름** - 로컬 실행
✅ **안정적** - 파일 기반 동기화
✅ **간단함** - Python 스크립트 하나로 끝

---

## 🔧 고급 사용

### 백그라운드 실행 (Windows)
```bash
start /min python watcher.py
```

### 백그라운드 실행 (Linux/Mac)
```bash
python watcher.py &
```

### 자동 시작 (선택)
- Windows: 시작 프로그램에 추가
- Linux: systemd service
- Mac: launchd

---

## ❓ 문제 해결

### Q: "watchdog 패키지가 없습니다"
```bash
pip install watchdog
```

### Q: "cards.json을 찾을 수 없습니다"
- watcher.py를 vocabulary-cards- 폴더에서 실행
- 또는 CARDS_FILE 경로 수정

### Q: "변경이 감지되지 않습니다"
- cards.json이 실제로 변경되었는지 확인
- Git commit & push 했는지 확인
- 파일 권한 확인

---

## 🎊 완성!

이제 Claude Code로 단어만 입력하면 자동으로 모든 게 처리됩니다! 🚀

**Happy Learning! 📚✨**
