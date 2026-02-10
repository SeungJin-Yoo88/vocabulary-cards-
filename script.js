// 카드 데이터 저장소
let cards = [];
let currentFilter = 'all';
let reviewMode = false;
let reviewCards = [];
let currentReviewIndex = 0;

// DOM 요소
const cardsGrid = document.getElementById('cardsGrid');
const emptyState = document.getElementById('emptyState');
const addCardBtn = document.getElementById('addCardBtn');
const addCardModal = document.getElementById('addCardModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const addCardForm = document.getElementById('addCardForm');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const reviewModeBtn = document.getElementById('reviewModeBtn');
const reviewModeSection = document.getElementById('reviewMode');
const exitReviewBtn = document.getElementById('exitReviewBtn');
const totalCardsSpan = document.getElementById('totalCards');
const favoriteCardsSpan = document.getElementById('favoriteCards');

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
    await loadCards();
    renderCards();
    updateStats();

    // 이벤트 리스너
    addCardBtn.addEventListener('click', () => openModal());
    closeModal.addEventListener('click', () => closeModalFn());
    cancelBtn.addEventListener('click', () => closeModalFn());
    addCardForm.addEventListener('submit', handleAddCard);
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('input', handleSearch);
    reviewModeBtn.addEventListener('click', startReviewMode);
    exitReviewBtn.addEventListener('click', exitReviewMode);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderCards();
        });
    });

    // 모달 외부 클릭 시 닫기
    addCardModal.addEventListener('click', (e) => {
        if (e.target === addCardModal) {
            closeModalFn();
        }
    });

    // 샘플 카드 추가 (처음 실행 시)
    if (cards.length === 0) {
        addSampleCard();
    }
});

// 로컬 스토리지 + cards.json에서 카드 로드
async function loadCards() {
    let jsonCards = [];

    // cards.json 파일에서 로드 (자동 추가된 카드들)
    try {
        const response = await fetch('cards.json');
        if (response.ok) {
            jsonCards = await response.json();
        }
    } catch (error) {
        console.log('cards.json을 읽을 수 없습니다. localStorage만 사용합니다.');
    }

    // localStorage에서 로드 (수동으로 추가한 카드들)
    let localCards = [];
    const stored = localStorage.getItem('vocabularyCards');
    if (stored) {
        localCards = JSON.parse(stored);
    }

    // 두 가지 소스 병합 (JSON 카드가 앞에 오도록)
    // 중복 제거 (같은 단어는 하나만)
    const allCards = [...jsonCards, ...localCards];
    const uniqueCards = allCards.filter((card, index, self) =>
        index === self.findIndex(c => c.word.toLowerCase() === card.word.toLowerCase())
    );

    cards = uniqueCards;
}

// 로컬 스토리지에 카드 저장
function saveCards() {
    localStorage.setItem('vocabularyCards', JSON.stringify(cards));
}

// 샘플 카드 추가
function addSampleCard() {
    const sampleCard = {
        id: Date.now(),
        word: 'conspiracy theory',
        pronunciation: '컨스피러시 씨어리',
        meaning: '어떤 사건이나 상황이 비밀스러운 집단이나 조직의 계획적인 음모에 의해 일어났다고 믿는 이론이나 설명',
        example: 'Some people believe in conspiracy theories about the moon landing.\n→ 어떤 사람들은 달 착륙에 대한 음모론을 믿는다.',
        related: '유의어: alternative explanation, speculation\n관련어: conspiracy theorist (음모론자), debunk (반박하다)',
        tips: '어원: 라틴어 conspirare (함께 숨을 쉬다)\n기억법: 비밀 모임에서 만들어진 이론!',
        favorite: false,
        createdAt: Date.now()
    };
    cards.push(sampleCard);
    saveCards();
}

// 모달 열기
function openModal() {
    addCardModal.classList.remove('hidden');
    document.getElementById('wordInput').focus();
}

// 모달 닫기
function closeModalFn() {
    addCardModal.classList.add('hidden');
    addCardForm.reset();
}

// 카드 추가 처리
function handleAddCard(e) {
    e.preventDefault();

    const newCard = {
        id: Date.now(),
        word: document.getElementById('wordInput').value.trim(),
        pronunciation: document.getElementById('pronunciationInput').value.trim(),
        meaning: document.getElementById('meaningInput').value.trim(),
        example: document.getElementById('exampleInput').value.trim(),
        related: document.getElementById('relatedInput').value.trim(),
        tips: document.getElementById('tipsInput').value.trim(),
        favorite: false,
        createdAt: Date.now()
    };

    cards.unshift(newCard); // 맨 앞에 추가
    saveCards();
    renderCards();
    updateStats();
    closeModalFn();

    // 성공 알림
    showNotification('✅ 카드가 추가되었습니다!');
}

// 검색 처리
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    renderCards(searchTerm);
}

// 카드 렌더링
function renderCards(searchTerm = '') {
    let filteredCards = cards;

    // 필터 적용
    if (currentFilter === 'favorites') {
        filteredCards = cards.filter(card => card.favorite);
    }

    // 검색어 적용
    if (searchTerm) {
        filteredCards = filteredCards.filter(card =>
            card.word.toLowerCase().includes(searchTerm) ||
            card.meaning.toLowerCase().includes(searchTerm)
        );
    }

    // 빈 상태 처리
    if (filteredCards.length === 0) {
        cardsGrid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    cardsGrid.innerHTML = '';

    filteredCards.forEach(card => {
        const cardElement = createCardElement(card);
        cardsGrid.appendChild(cardElement);
    });
}

// 카드 요소 생성
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'flashcard';
    cardDiv.dataset.id = card.id;

    cardDiv.innerHTML = `
        <div class="flashcard-inner">
            <div class="flashcard-front">
                <div class="card-actions">
                    <button class="favorite-btn ${card.favorite ? 'active' : ''}" onclick="toggleFavorite(${card.id})">
                        ${card.favorite ? '⭐' : '☆'}
                    </button>
                    <button class="delete-btn" onclick="deleteCard(${card.id})">🗑️</button>
                </div>
                <div class="word-display">${card.word}</div>
                ${card.pronunciation ? `<div class="pronunciation">${card.pronunciation}</div>` : ''}
                <div class="flip-hint">💡 카드를 클릭해서 뒤집어보세요</div>
            </div>
            <div class="flashcard-back">
                <div class="card-actions">
                    <button class="favorite-btn ${card.favorite ? 'active' : ''}" onclick="toggleFavorite(${card.id})">
                        ${card.favorite ? '⭐' : '☆'}
                    </button>
                    <button class="delete-btn" onclick="deleteCard(${card.id})">🗑️</button>
                </div>
                <div class="card-content">
                    <h3>💡 의미</h3>
                    <p>${card.meaning}</p>

                    ${card.example ? `
                        <h3>✨ 예문</h3>
                        <p>${card.example.replace(/\n/g, '<br>')}</p>
                    ` : ''}

                    ${card.related ? `
                        <h3>🔄 관련 단어</h3>
                        <p>${card.related.replace(/\n/g, '<br>')}</p>
                    ` : ''}

                    ${card.tips ? `
                        <h3>🌱 팁 & 기억법</h3>
                        <p>${card.tips.replace(/\n/g, '<br>')}</p>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    // 카드 뒤집기 이벤트
    cardDiv.addEventListener('click', (e) => {
        // 버튼 클릭 시에는 뒤집기 안함
        if (e.target.classList.contains('favorite-btn') ||
            e.target.classList.contains('delete-btn')) {
            return;
        }
        cardDiv.classList.toggle('flipped');
    });

    return cardDiv;
}

// 즐겨찾기 토글
function toggleFavorite(id) {
    const card = cards.find(c => c.id === id);
    if (card) {
        card.favorite = !card.favorite;
        saveCards();
        renderCards();
        updateStats();
    }
}

// 카드 삭제
function deleteCard(id) {
    if (confirm('정말로 이 카드를 삭제하시겠습니까?')) {
        cards = cards.filter(c => c.id !== id);
        saveCards();
        renderCards();
        updateStats();
        showNotification('🗑️ 카드가 삭제되었습니다.');
    }
}

// 통계 업데이트
function updateStats() {
    totalCardsSpan.textContent = cards.length;
    favoriteCardsSpan.textContent = cards.filter(c => c.favorite).length;
}

// 복습 모드 시작
function startReviewMode() {
    if (cards.length === 0) {
        showNotification('⚠️ 복습할 카드가 없습니다.');
        return;
    }

    reviewMode = true;
    reviewCards = [...cards];
    shuffleArray(reviewCards);
    currentReviewIndex = 0;

    cardsGrid.classList.add('hidden');
    reviewModeSection.classList.remove('hidden');

    renderReviewCard();
}

// 복습 모드 종료
function exitReviewMode() {
    reviewMode = false;
    cardsGrid.classList.remove('hidden');
    reviewModeSection.classList.add('hidden');
}

// 복습 카드 렌더링
function renderReviewCard() {
    const container = document.getElementById('reviewCardContainer');
    const progress = document.getElementById('reviewProgress');

    progress.textContent = `${currentReviewIndex + 1} / ${reviewCards.length}`;

    container.innerHTML = '';
    const card = reviewCards[currentReviewIndex];
    const cardElement = createCardElement(card);
    container.appendChild(cardElement);

    // 복습 모드 컨트롤
    document.getElementById('prevCardBtn').onclick = () => {
        if (currentReviewIndex > 0) {
            currentReviewIndex--;
            renderReviewCard();
        }
    };

    document.getElementById('nextCardBtn').onclick = () => {
        if (currentReviewIndex < reviewCards.length - 1) {
            currentReviewIndex++;
            renderReviewCard();
        } else {
            showNotification('🎉 모든 카드를 복습했습니다!');
        }
    };

    document.getElementById('shuffleBtn').onclick = () => {
        shuffleArray(reviewCards);
        currentReviewIndex = 0;
        renderReviewCard();
        showNotification('🔀 카드 순서를 섞었습니다.');
    };
}

// 배열 섞기 (Fisher-Yates 알고리즘)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 알림 표시
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// 애니메이션 스타일 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
