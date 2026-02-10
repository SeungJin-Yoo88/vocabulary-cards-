# 📚 나만의 영어 단어장 - Vocabulary Cards

AI 기반 스마트 영어 단어 학습 앱

## ✨ 주요 기능

### Phase 1: Foundation
- **🤖 AI 자동 채우기**: Claude API를 사용하여 단어만 입력하면 모든 정보를 자동으로 생성
- **🔊 음성 발음**: Web Speech API를 사용한 영어 단어 발음 재생
- **🏷️ 사용자 정의 카테고리**: 개인 맞춤형 카테고리 생성 및 관리

### Phase 2: Engagement
- **🧠 SRS 알고리즘**: 과학적인 간격 반복 학습 시스템 (Spaced Repetition System)
- **📊 학습 통계**: 진행도 추적, 연속 학습일, 마스터한 단어 수 등
- **💾 Import/Export**: JSON 형식으로 데이터 백업 및 복원

### Phase 3: Polish
- **📱 PWA 지원**: 앱처럼 설치 가능, 오프라인 지원
- **🌙 다크모드**: 야간 학습에 최적화된 다크 테마

## 🚀 시작하기

### 1. 로컬에서 실행

```bash
# 프로젝트 디렉토리로 이동
cd vocabulary-cards

# 단순 웹 서버로 실행 (Python 3)
python -m http.server 8000

# 또는 Node.js
npx serve
```

브라우저에서 `http://localhost:8000` 접속

### 2. Vercel에 배포 (AI 기능 사용 시 필요)

```bash
# 의존성 설치
npm install

# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 환경 변수 설정
vercel env add ANTHROPIC_API_KEY

# 배포
vercel deploy
```

**환경 변수 설정:**
- `ANTHROPIC_API_KEY`: [Anthropic Console](https://console.anthropic.com/)에서 발급

### 3. PWA 아이콘 생성

앱 아이콘이 필요합니다. 다음 크기로 생성하세요:
- `icon-192.png` (192x192 픽셀)
- `icon-512.png` (512x512 픽셀)

**아이콘 생성 방법:**

1. **온라인 도구 사용:**
   - [Favicon Generator](https://favicon.io/)
   - [PWA Asset Generator](https://www.pwabuilder.com/)

2. **직접 생성:**
   - 로고나 이미지 준비 (512x512 이상)
   - Photoshop, GIMP, Canva 등으로 리사이즈
   - PNG 형식으로 저장

## 📖 사용 방법

### 카드 추가
1. **수동 추가**: "➕ 새 카드" 버튼 클릭 → 모든 정보 입력
2. **AI 자동 채우기**: 단어만 입력 → "✨ AI 채우기" 버튼 클릭

### 복습하기
1. "🎯 복습 모드" 버튼 클릭
2. 카드를 클릭하여 뒤집기
3. 🔊 버튼으로 발음 듣기
4. 난이도 평가 (못 외웠음 / 어려움 / 보통 / 쉬움)

### 카테고리 관리
1. "🏷️ 카테고리 관리" 버튼 클릭
2. 새 카테고리 추가 (이름, 아이콘, 색상 선택)
3. 카드 추가 시 카테고리 선택

### 데이터 백업
1. "⚙️ 설정" 버튼 클릭
2. "📤 카드 내보내기" → JSON 파일 다운로드
3. "📥 카드 가져오기" → JSON 파일 업로드

## 🏗️ 프로젝트 구조

```
vocabulary-cards/
├── index.html              # 메인 HTML
├── style.css               # 스타일시트
├── script.js               # 메인 JavaScript
├── cards.json              # 샘플 카드 데이터
├── manifest.json           # PWA 매니페스트
├── service-worker.js       # Service Worker (오프라인 지원)
├── js/
│   └── srs-engine.js       # SRS 알고리즘 엔진
├── api/
│   └── generate-card.js    # AI 자동 생성 API (Serverless)
├── icon-192.png            # PWA 아이콘 (192x192) - 생성 필요
└── icon-512.png            # PWA 아이콘 (512x512) - 생성 필요
```

## 🛠️ 기술 스택

- **Frontend**: Vanilla JavaScript (프레임워크 없음)
- **Storage**: localStorage (클라이언트 사이드)
- **AI**: Anthropic Claude API (Claude Sonnet 4.5)
- **Deployment**: Vercel Serverless Functions
- **PWA**: Service Worker, Web Manifest

## 📊 SRS 알고리즘

간소화된 SM-2 알고리즘 사용:
- **못 외웠음**: 1일 후 복습
- **어려움**: 3일 후 복습
- **보통**: 7일 후 복습
- **쉬움**: 14일 후 복습

복습 횟수가 증가할수록 간격이 자동으로 증가합니다.

## 🔒 개인정보 보호

- 모든 데이터는 브라우저의 localStorage에 로컬 저장
- 서버에 데이터 전송 없음 (AI 생성 시에만 단어 전송)
- 완전한 오프라인 사용 가능 (AI 기능 제외)

## 🐛 문제 해결

### AI 자동 채우기가 작동하지 않음
- Vercel에 배포했는지 확인
- 환경 변수 `ANTHROPIC_API_KEY`가 설정되었는지 확인
- API 크레딧이 남아있는지 확인

### PWA 설치 버튼이 나타나지 않음
- HTTPS로 접속했는지 확인 (localhost는 예외)
- manifest.json과 service-worker.js가 올바르게 로드되는지 확인
- 아이콘 파일이 존재하는지 확인

### 음성이 나오지 않음
- 브라우저가 Web Speech API를 지원하는지 확인
- Chrome, Edge, Safari 권장
- 시스템 볼륨 확인

## 📝 라이선스

MIT License

## 🙏 크레딧

- **AI API**: Anthropic Claude
- **배포**: Vercel

---

Made with ❤️ for English learners
