# 🚀 Vercel 배포 가이드

## ✅ 준비 완료 사항

- ✅ 모든 코드 구현 완료
- ✅ Git에 커밋 및 푸시 완료
- ✅ 아이콘 파일 생성 완료 (SVG)
- ✅ npm 의존성 설치 완료

---

## 📋 Vercel 배포 단계

### 방법 1: Vercel 웹 대시보드 (추천 - 가장 쉬움)

#### 1️⃣ Vercel 계정 생성 및 로그인
1. https://vercel.com/ 접속
2. GitHub 계정으로 로그인 (Sign Up with GitHub)

#### 2️⃣ 프로젝트 Import
1. Vercel 대시보드에서 **"Add New Project"** 클릭
2. GitHub 저장소 연결 허용
3. **"SeungJin-Yoo88/vocabulary-cards-"** 저장소 선택
4. **"Import"** 클릭

#### 3️⃣ 프로젝트 설정
- **Framework Preset**: Other (자동 선택됨)
- **Root Directory**: `./` (기본값)
- **Build Command**: 비워두기 (정적 사이트)
- **Output Directory**: `./` (기본값)

#### 4️⃣ 환경 변수 설정 (중요!)
**Environment Variables** 섹션에서:

```
Name: ANTHROPIC_API_KEY
Value: [여기에 API 키 입력]
Environment: Production, Preview, Development (모두 선택)
```

**API 키 받는 방법:**
1. https://console.anthropic.com/ 접속
2. 로그인 또는 계정 생성
3. "API Keys" 메뉴에서 "Create Key"
4. 생성된 키 복사 (sk-ant-... 형식)
5. Vercel에 붙여넣기

#### 5️⃣ 배포
1. **"Deploy"** 버튼 클릭
2. 배포 진행 상황 확인 (약 1-2분 소요)
3. 배포 완료 후 도메인 확인 (예: vocabulary-cards.vercel.app)

---

### 방법 2: Vercel CLI (터미널 사용)

#### 1️⃣ Vercel 로그인
```bash
cd vocabulary-cards
npx vercel login
```
- 브라우저가 열리면 로그인 확인

#### 2️⃣ 환경 변수 설정
```bash
npx vercel env add ANTHROPIC_API_KEY
```
- Production 선택
- API 키 입력

#### 3️⃣ 배포
```bash
npx vercel --prod
```

---

## 🔑 Anthropic API 키 발급 방법

### 무료 크레딧으로 시작하기

1. **계정 생성**
   - https://console.anthropic.com/ 접속
   - Email로 가입 또는 Google 계정 연동

2. **무료 크레딧 받기**
   - 신규 가입 시 $5 크레딧 제공 (2025년 기준)
   - 약 1,500~3,000회 AI 카드 생성 가능

3. **API 키 생성**
   - Console → "API Keys" 메뉴
   - "Create Key" 클릭
   - 이름 입력 (예: "Vocabulary Cards")
   - 키 복사 (⚠️ 한 번만 보여짐!)

4. **사용량 모니터링**
   - Console → "Usage" 메뉴
   - 실시간 사용량 및 남은 크레딧 확인

### 비용 안내
- **Claude Sonnet 4.5**: 입력 $3/1M tokens, 출력 $15/1M tokens
- **카드 1개 생성**: 약 $0.003~0.01 (평균 $0.005)
- **무료 크레딧 $5**: 약 1,000~1,500개 카드 생성 가능

---

## ✅ 배포 후 확인 사항

### 1. 기본 기능 테스트
- [ ] 사이트 접속 확인
- [ ] 카드 추가 (수동)
- [ ] 카테고리 관리
- [ ] 다크모드 전환
- [ ] 통계 대시보드 표시

### 2. AI 기능 테스트
- [ ] 카드 추가 폼 열기
- [ ] 단어 입력 (예: "resilient")
- [ ] "✨ AI 채우기" 버튼 클릭
- [ ] 모든 필드 자동 채워지는지 확인
- [ ] 생성된 내용 품질 확인

### 3. PWA 설치 테스트
- [ ] HTTPS 주소 확인 (vercel.app)
- [ ] Chrome 주소창에 설치 아이콘 표시
- [ ] "📱 앱으로 설치" 버튼 나타남 (3초 후)
- [ ] 앱 설치 후 독립 실행

### 4. 오프라인 테스트
- [ ] 앱 설치 후 오프라인 모드로 전환
- [ ] 페이지 로드 확인
- [ ] 카드 보기 가능 (AI 제외)

---

## 🐛 문제 해결

### AI 자동 채우기가 작동하지 않음

**증상**: "✨ AI 채우기" 버튼 클릭 시 오류 메시지

**해결 방법**:
1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Environment Variables
3. `ANTHROPIC_API_KEY` 확인
4. 없으면 추가, 있으면 값 확인
5. 변경 후 Deployments → 최신 배포 → "Redeploy"

**확인 방법**:
- 브라우저 개발자 도구 (F12)
- Console 탭에서 오류 메시지 확인
- Network 탭에서 `/api/generate-card` 요청 확인

### PWA 설치 버튼이 나타나지 않음

**원인**:
- HTTP로 접속 (HTTPS 필요)
- 브라우저가 PWA 미지원
- manifest.json 로드 실패

**해결 방법**:
1. HTTPS 주소로 접속 (vercel.app)
2. Chrome 또는 Edge 사용
3. F12 → Application → Manifest 확인
4. Service Worker 등록 확인

### 음성 발음이 작동하지 않음

**원인**: 브라우저 호환성

**해결 방법**:
- Chrome, Edge, Safari 사용 권장
- 시스템 볼륨 확인
- 브라우저 권한 확인

---

## 📊 배포 후 분석

### Vercel Analytics (선택)
1. Vercel 대시보드 → 프로젝트
2. Analytics 탭
3. 방문자 수, 성능 지표 확인

### 사용량 모니터링
- Anthropic Console에서 API 사용량 확인
- 일일/월별 사용 패턴 분석
- 크레딧 소진 전 알림 설정

---

## 🎯 다음 단계

배포 완료 후:

1. **도메인 커스터마이징** (선택)
   - Vercel: Settings → Domains
   - 무료 서브도메인 변경 가능
   - 커스텀 도메인 연결 가능

2. **성능 최적화**
   - Vercel Edge Network 자동 활성화
   - 전 세계 빠른 로딩
   - 자동 HTTPS 및 CDN

3. **실제 사용 시작**
   - 본인의 단어장으로 사용
   - 친구들과 공유
   - 피드백 수집

---

## 📞 지원

### Vercel 관련
- 문서: https://vercel.com/docs
- 커뮤니티: https://github.com/vercel/vercel/discussions

### Anthropic API 관련
- 문서: https://docs.anthropic.com/
- 지원: https://support.anthropic.com/

### 프로젝트 관련
- GitHub Issues: https://github.com/SeungJin-Yoo88/vocabulary-cards-/issues

---

## 🎉 축하합니다!

배포가 완료되면 전 세계 어디서나 접속 가능한 나만의 영어 단어장 앱을 갖게 됩니다!

**생성된 URL 예시**:
- https://vocabulary-cards-xxxx.vercel.app

이 URL을 북마크하고 친구들과 공유하세요! 📱✨
