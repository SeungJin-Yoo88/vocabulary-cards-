// 카드 데이터 저장소
let cards = [];
let trashedCards = []; // 휴지통 (삭제된 카드들)
let categories = [];
let currentFilter = 'all';
let selectedCategories = [];
let reviewMode = false;
let reviewCards = [];
let currentReviewIndex = 0;
let srsManager = null;
let stats = {
    totalWordsLearned: 0,
    totalReviews: 0,
    studyDays: 0,
    streakDays: 0,
    lastStudyDate: null
};

// 스와이프 모드용 변수
let currentSwipeIndex = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchCurrentX = 0;
let touchCurrentY = 0;
let isSwiping = false;

// DOM 요소
const cardsGrid = document.getElementById('cardsGrid');
const emptyState = document.getElementById('emptyState');
// 새 카드 추가 UI 제거됨 (Claude Code /vocab-card 스킬 사용)
// const addCardBtn = document.getElementById('addCardBtn');
// const addCardModal = document.getElementById('addCardModal');
// const closeModal = document.getElementById('closeModal');
// const cancelBtn = document.getElementById('cancelBtn');
// const addCardForm = document.getElementById('addCardForm');
// const aiGenerateBtn = document.getElementById('aiGenerateBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const reviewModeBtn = document.getElementById('reviewModeBtn');
const reviewModeSection = document.getElementById('reviewMode');
const exitReviewBtn = document.getElementById('exitReviewBtn');
const totalCardsSpan = document.getElementById('totalCards');
const favoriteCardsSpan = document.getElementById('favoriteCards');
const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
const categoryModal = document.getElementById('categoryModal');
const closeCategoryModal = document.getElementById('closeCategoryModal');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsModal = document.getElementById('closeSettingsModal');
const themeToggle = document.getElementById('themeToggle');
const trashBtn = document.getElementById('trashBtn');
const trashModal = document.getElementById('trashModal');
const closeTrashModal = document.getElementById('closeTrashModal');

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
    srsManager = new SRSManager();
    loadTheme();
    loadCategories();
    loadStats();
    loadTrashedCards(); // 휴지통 로드
    await loadCards();
    initializeCardStates();
    renderCategories();
    renderCards();
    updateStats();
    updateStreak();
    registerServiceWorker();

    // 이벤트 리스너
    // 새 카드 추가 UI 제거됨
    // addCardBtn.addEventListener('click', () => openModal());
    // closeModal.addEventListener('click', () => closeModalFn());
    // cancelBtn.addEventListener('click', () => closeModalFn());
    // addCardForm.addEventListener('submit', handleAddCard);
    // aiGenerateBtn.addEventListener('click', handleAIGenerate);
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('input', handleSearch);
    reviewModeBtn.addEventListener('click', startReviewMode);
    exitReviewBtn.addEventListener('click', exitReviewMode);
    manageCategoriesBtn.addEventListener('click', openCategoryModal);
    closeCategoryModal.addEventListener('click', closeCategoryModalFn);
    settingsBtn.addEventListener('click', openSettingsModal);
    closeSettingsModal.addEventListener('click', closeSettingsModalFn);
    themeToggle.addEventListener('click', toggleTheme);
    trashBtn.addEventListener('click', openTrashModal);
    closeTrashModal.addEventListener('click', closeTrashModalFn);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderCards();
        });
    });

    // 탭 네비게이션 초기화
    initTabNavigation();

    // 스와이프 기능 초기화
    initSwiper();

    // 셔플 버튼
    const shuffleCardsBtn = document.getElementById('shuffleCardsBtn');
    if (shuffleCardsBtn) {
        shuffleCardsBtn.addEventListener('click', shuffleCards);
    }

    // 카드 팝업 초기화
    initCardPopup();

    // 모달 외부 클릭 시 닫기
    // 새 카드 추가 모달 제거됨
    // addCardModal.addEventListener('click', (e) => {
    //     if (e.target === addCardModal) {
    //         closeModalFn();
    //     }
    // });

    categoryModal.addEventListener('click', (e) => {
        if (e.target === categoryModal) {
            closeCategoryModalFn();
        }
    });

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettingsModalFn();
        }
    });

    trashModal.addEventListener('click', (e) => {
        if (e.target === trashModal) {
            closeTrashModalFn();
        }
    });

    // cards.json에 기본 카드가 있으므로 샘플 카드 추가 로직 제거됨
});

// 로컬 스토리지 + cards.json에서 카드 로드 (자동 병합)
async function loadCards() {
    const deletedIds = getDeletedCardIds();
    let cardsFromJson = [];
    let cardsFromStorage = [];

    // 1. cards.json에서 기본 카드 로드
    try {
        const response = await fetch('cards.json');
        if (response.ok) {
            cardsFromJson = await response.json();
        }
    } catch (error) {
        console.log('cards.json을 읽을 수 없습니다.');
    }

    // 2. localStorage에서 카드 로드
    const stored = localStorage.getItem('vocabularyCards');
    if (stored) {
        cardsFromStorage = JSON.parse(stored);
    }

    // 3. 병합: cards.json 카드 + localStorage 고유 카드
    const jsonCardIds = new Set(cardsFromJson.map(c => c.id));
    const mergedCards = [...cardsFromJson];

    // localStorage에만 있는 카드 추가 (사용자가 직접 추가한 카드)
    cardsFromStorage.forEach(card => {
        if (!jsonCardIds.has(card.id)) {
            mergedCards.push(card);
        }
    });

    // 4. 삭제된 카드 제외
    cards = mergedCards.filter(card => !deletedIds.has(card.id));

    // 5. 최신 상태 저장
    saveCards();
}

// 삭제된 카드 ID 목록 가져오기
function getDeletedCardIds() {
    const stored = localStorage.getItem('deletedCardIds');
    return stored ? new Set(JSON.parse(stored)) : new Set();
}

// 삭제된 카드 ID 저장
function saveDeletedCardId(id) {
    const deletedIds = getDeletedCardIds();
    deletedIds.add(id);
    localStorage.setItem('deletedCardIds', JSON.stringify([...deletedIds]));
}

// 로컬 스토리지에 카드 저장
function saveCards() {
    localStorage.setItem('vocabularyCards', JSON.stringify(cards));
}

// 카드 state 초기화
function initializeCardStates() {
    cards.forEach(card => {
        if (!card.state) {
            card.state = srsManager.initializeState();
        }
    });
    saveCards();
}

// 카테고리 로드
function loadCategories() {
    const stored = localStorage.getItem('vocabularyCategories');
    if (stored) {
        categories = JSON.parse(stored);
    } else {
        // 기본 카테고리
        categories = [
            { id: 'cat1', name: '비즈니스', color: '#667eea', icon: '💼' },
            { id: 'cat2', name: '일상', color: '#51cf66', icon: '💬' },
            { id: 'cat3', name: '학술', color: '#ff6b6b', icon: '📚' }
        ];
        saveCategories();
    }
}

// 카테고리 저장
function saveCategories() {
    localStorage.setItem('vocabularyCategories', JSON.stringify(categories));
}

// 휴지통 로드
function loadTrashedCards() {
    const stored = localStorage.getItem('trashedCards');
    if (stored) {
        trashedCards = JSON.parse(stored);
    }
}

// 휴지통 저장
function saveTrashedCards() {
    localStorage.setItem('trashedCards', JSON.stringify(trashedCards));
}

// 샘플 카드 추가 함수 제거됨 (cards.json에 기본 카드 존재)

// 모달 열기
function openModal() {
    addCardModal.classList.remove('hidden');
    renderCategoryCheckboxes();
    document.getElementById('wordInput').focus();
}

// 모달 닫기
function closeModalFn() {
    addCardModal.classList.add('hidden');
    addCardForm.reset();
}

// AI 자동 생성 (Claude Code 스킬 활용)
async function handleAIGenerate() {
    const wordInput = document.getElementById('wordInput');
    const word = wordInput.value.trim();

    if (!word) {
        showNotification('⚠️ 먼저 단어를 입력해주세요.');
        wordInput.focus();
        return;
    }

    // Claude Code 명령어 생성
    const command = `/vocab-card ${word}`;

    // 클립보드에 복사
    try {
        await navigator.clipboard.writeText(command);

        // 안내 모달 표시
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 500px;
            text-align: center;
        `;

        modal.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 15px;">🤖</div>
            <h3 style="margin: 0 0 15px 0; color: #212529;">Claude Code에서 실행하세요!</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; font-family: monospace; font-size: 1.1rem; color: #495057;">
                ${command}
            </div>
            <p style="color: #868e96; margin: 15px 0; line-height: 1.6;">
                ✅ 명령어가 클립보드에 복사되었습니다!<br>
                Claude Code에 붙여넣기(Ctrl+V)하세요.
            </p>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 15px;
                padding: 12px 30px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 1rem;
            ">확인</button>
        `;

        document.body.appendChild(modal);

        // 5초 후 자동 닫기
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.remove();
            }
        }, 5000);

        showNotification('📋 명령어가 복사되었습니다!');

    } catch (error) {
        // 클립보드 복사 실패 시 명령어 표시
        alert(`다음 명령어를 Claude Code에 복사-붙여넣기 하세요:\n\n${command}`);
    }
}

// 카드 추가 처리
function handleAddCard(e) {
    e.preventDefault();

    // 선택된 카테고리 가져오기
    const selectedCats = [];
    document.querySelectorAll('#categoryCheckboxes input:checked').forEach(checkbox => {
        selectedCats.push(checkbox.value);
    });

    const newCard = {
        id: Date.now(),
        word: document.getElementById('wordInput').value.trim(),
        pronunciation: document.getElementById('pronunciationInput').value.trim(),
        meaning: document.getElementById('meaningInput').value.trim(),
        example: document.getElementById('exampleInput').value.trim(),
        related: document.getElementById('relatedInput').value.trim(),
        tips: document.getElementById('tipsInput').value.trim(),
        categories: selectedCats,
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

// 카테고리 렌더링
function renderCategories() {
    const filterContainer = document.getElementById('categoryFilters');
    filterContainer.innerHTML = '';

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn category-filter-btn';
        btn.dataset.categoryId = cat.id;
        btn.style.borderColor = cat.color;
        btn.innerHTML = `${cat.icon} ${cat.name}`;

        btn.addEventListener('click', () => {
            btn.classList.toggle('active');

            // 다른 필터 비활성화
            document.querySelectorAll('.filter-btn:not(.category-filter-btn)').forEach(b => {
                b.classList.remove('active');
            });

            // 선택된 카테고리 업데이트
            selectedCategories = Array.from(
                document.querySelectorAll('.category-filter-btn.active')
            ).map(b => b.dataset.categoryId);

            currentFilter = selectedCategories.length > 0 ? 'categories' : 'all';
            renderCards();
        });

        filterContainer.appendChild(btn);
    });
}

// 카테고리 체크박스 렌더링
function renderCategoryCheckboxes() {
    const container = document.getElementById('categoryCheckboxes');
    container.innerHTML = '';

    if (categories.length === 0) {
        container.innerHTML = '<p style="color: #999;">카테고리가 없습니다. 카테고리 관리에서 추가하세요.</p>';
        return;
    }

    categories.forEach(cat => {
        const label = document.createElement('label');
        label.className = 'category-checkbox-label';
        label.style.borderColor = cat.color;
        label.innerHTML = `
            <input type="checkbox" value="${cat.id}" name="categories">
            <span style="color: ${cat.color}">${cat.icon} ${cat.name}</span>
        `;
        container.appendChild(label);
    });
}

// 카테고리 모달 열기
function openCategoryModal() {
    categoryModal.classList.remove('hidden');
    renderCategoryList();
}

// 카테고리 모달 닫기
function closeCategoryModalFn() {
    categoryModal.classList.add('hidden');
}

// 카테고리 목록 렌더링
function renderCategoryList() {
    const list = document.getElementById('categoryList');
    list.innerHTML = '';

    if (categories.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999;">카테고리가 없습니다.</p>';
        return;
    }

    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'category-item';
        item.style.borderLeft = `4px solid ${cat.color}`;
        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.5rem;">${cat.icon}</span>
                <span style="font-weight: 600; color: ${cat.color};">${cat.name}</span>
            </div>
            <button onclick="deleteCategory('${cat.id}')" class="delete-btn" title="삭제">🗑️</button>
        `;
        list.appendChild(item);
    });
}

// 카테고리 추가
function addCategory() {
    const name = document.getElementById('newCategoryName').value.trim();
    const icon = document.getElementById('newCategoryIcon').value;
    const color = document.getElementById('newCategoryColor').value;

    if (!name) {
        showNotification('⚠️ 카테고리 이름을 입력하세요.');
        return;
    }

    const newCategory = {
        id: 'cat' + Date.now(),
        name,
        icon,
        color
    };

    categories.push(newCategory);
    saveCategories();
    renderCategoryList();
    renderCategories();

    // 폼 초기화
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newCategoryIcon').value = '💼';
    document.getElementById('newCategoryColor').value = '#667eea';

    showNotification('✅ 카테고리가 추가되었습니다!');
}

// 카테고리 삭제
function deleteCategory(id) {
    if (!confirm('이 카테고리를 삭제하시겠습니까?')) {
        return;
    }

    categories = categories.filter(cat => cat.id !== id);
    saveCategories();
    renderCategoryList();
    renderCategories();
    showNotification('🗑️ 카테고리가 삭제되었습니다.');
}

// 설정 모달 열기
function openSettingsModal() {
    settingsModal.classList.remove('hidden');
}

// 설정 모달 닫기
function closeSettingsModalFn() {
    settingsModal.classList.add('hidden');
}

// 카드 내보내기
function exportCards() {
    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        cards: cards,
        categories: categories,
        stats: stats
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `vocabulary-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('✅ 카드를 내보냈습니다!');
}

// 카드 가져오기
function importCards(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importData = JSON.parse(e.target.result);

            // 데이터 유효성 검증
            if (!importData.cards || !Array.isArray(importData.cards)) {
                throw new Error('올바른 형식의 백업 파일이 아닙니다.');
            }

            // 사용자 확인
            const confirmMsg = `${importData.cards.length}개의 카드를 가져오시겠습니까?\n\n` +
                `현재 카드: ${cards.length}개\n` +
                `중복된 단어는 건너뛰고, 새로운 카드만 추가됩니다.`;

            if (!confirm(confirmMsg)) {
                return;
            }

            // 기존 단어 목록
            const existingWords = new Set(cards.map(c => c.word.toLowerCase()));

            // 새로운 카드만 추가
            let importedCount = 0;
            importData.cards.forEach(card => {
                if (!existingWords.has(card.word.toLowerCase())) {
                    cards.push(card);
                    importedCount++;
                }
            });

            // 카테고리 병합
            if (importData.categories && Array.isArray(importData.categories)) {
                const existingCatIds = new Set(categories.map(c => c.id));
                importData.categories.forEach(cat => {
                    if (!existingCatIds.has(cat.id)) {
                        categories.push(cat);
                    }
                });
                saveCategories();
                renderCategories();
            }

            // 통계 병합 (선택적)
            if (importData.stats) {
                stats.totalReviews = (stats.totalReviews || 0) + (importData.stats.totalReviews || 0);
                saveStats();
            }

            saveCards();
            renderCards();
            updateStats();

            showNotification(`✅ ${importedCount}개의 새로운 카드를 가져왔습니다!`);

            // 파일 입력 초기화
            event.target.value = '';

        } catch (error) {
            console.error('Import error:', error);
            showNotification('❌ 파일을 가져오는 중 오류가 발생했습니다: ' + error.message);
        }
    };

    reader.readAsText(file);
}

// 모든 데이터 초기화
function resetAllData() {
    const confirmation = prompt(
        '정말로 모든 데이터를 삭제하시겠습니까?\n' +
        '이 작업은 되돌릴 수 없습니다.\n\n' +
        '계속하려면 "삭제"를 입력하세요.'
    );

    if (confirmation !== '삭제') {
        return;
    }

    localStorage.removeItem('vocabularyCards');
    localStorage.removeItem('vocabularyCategories');
    localStorage.removeItem('vocabularyStats');
    localStorage.removeItem('deletedCardIds');

    cards = [];
    categories = [
        { id: 'cat1', name: '비즈니스', color: '#667eea', icon: '💼' },
        { id: 'cat2', name: '일상', color: '#51cf66', icon: '💬' },
        { id: 'cat3', name: '학술', color: '#ff6b6b', icon: '📚' }
    ];
    stats = {
        totalWordsLearned: 0,
        totalReviews: 0,
        studyDays: 0,
        streakDays: 0,
        lastStudyDate: null
    };

    saveCategories();
    saveStats();
    renderCategories();
    renderCards();
    updateStats();

    showNotification('🗑️ 모든 데이터가 삭제되었습니다.');
    closeSettingsModalFn();
}

// 다크모드 토글
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // 아이콘 변경
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    themeToggle.title = newTheme === 'dark' ? '라이트모드로 전환' : '다크모드로 전환';

    showNotification(newTheme === 'dark' ? '🌙 다크모드 활성화' : '☀️ 라이트모드 활성화');
}

// 테마 로드
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 아이콘 초기화
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    themeToggle.title = savedTheme === 'dark' ? '라이트모드로 전환' : '다크모드로 전환';
}

// 카드 렌더링
function renderCards(searchTerm = '') {
    let filteredCards = cards;

    // 필터 적용
    if (currentFilter === 'favorites') {
        filteredCards = cards.filter(card => card.favorite);
    } else if (currentFilter === 'due') {
        filteredCards = srsManager.getDueCards(cards);
    } else if (currentFilter === 'categories' && selectedCategories.length > 0) {
        filteredCards = cards.filter(card =>
            card.categories && card.categories.some(catId =>
                selectedCategories.includes(catId)
            )
        );
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

    // 스와이퍼도 업데이트
    if (typeof renderSwiper === 'function') {
        renderSwiper();
    }
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
                <div class="word-display">
                    <span class="word">${card.word}</span>
                    ${card.partOfSpeech ? `<span class="part-of-speech">${card.partOfSpeech}</span>` : ''}
                </div>
                <button class="speaker-btn" onclick="speakWord('${card.word.replace(/'/g, "\\'")}', event)" title="발음 듣기">
                    🔊
                </button>
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
                ${card.koreanWord ? `<div class="korean-word-display">${card.koreanWord}</div>` : ''}
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

    // 카드 클릭 시 팝업 열기
    cardDiv.addEventListener('click', (e) => {
        // 버튼 클릭 시에는 팝업 안 열림
        if (e.target.classList.contains('favorite-btn') ||
            e.target.classList.contains('delete-btn') ||
            e.target.classList.contains('speaker-btn') ||
            e.target.closest('.favorite-btn') ||
            e.target.closest('.delete-btn') ||
            e.target.closest('.speaker-btn')) {
            return;
        }
        openCardPopup(card.id);
    });

    return cardDiv;
}

// 단어 발음 (Web Speech API)
function speakWord(word, event) {
    if (event) {
        event.stopPropagation(); // 카드 뒤집기 방지
    }

    if (!('speechSynthesis' in window)) {
        showNotification('⚠️ 이 브라우저는 음성 기능을 지원하지 않습니다.');
        return;
    }

    // 이전 발음 중지
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8; // 느린 속도로 발음
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // 발음 시작/종료 이벤트
    utterance.onstart = () => {
        console.log('Speaking:', word);
    };

    utterance.onerror = (e) => {
        console.error('Speech error:', e);
        showNotification('⚠️ 발음 중 오류가 발생했습니다.');
    };

    window.speechSynthesis.speak(utterance);
}

// Service Worker 등록 (PWA)
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered successfully:', registration.scope);

                // 설치 가능한 앱인지 확인
                window.addEventListener('beforeinstallprompt', (e) => {
                    e.preventDefault();
                    // 설치 프롬프트를 저장해두고 나중에 사용 가능
                    window.deferredPrompt = e;
                    showInstallPrompt();
                });

                // 앱이 설치되었을 때
                window.addEventListener('appinstalled', () => {
                    console.log('PWA installed successfully');
                    showNotification('✅ 앱이 설치되었습니다!');
                    window.deferredPrompt = null;
                });
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// PWA 설치 프롬프트 표시
function showInstallPrompt() {
    // 설치 버튼을 표시하거나 알림을 띄울 수 있음
    const installBtn = document.createElement('button');
    installBtn.textContent = '📱 앱으로 설치';
    installBtn.className = 'install-prompt-btn';
    installBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: bounce 2s infinite;
    `;

    installBtn.onclick = async () => {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            const { outcome } = await window.deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            window.deferredPrompt = null;
            installBtn.remove();
        }
    };

    // 10초 후에 자동으로 제거
    setTimeout(() => {
        if (document.body.contains(installBtn)) {
            document.body.appendChild(installBtn);
        }
    }, 3000);
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

// 카드 삭제 (휴지통으로 이동)
function deleteCard(id) {
    if (confirm('카드를 휴지통으로 이동하시겠습니까?')) {
        const card = cards.find(c => c.id === id);
        if (card) {
            // 휴지통으로 이동
            trashedCards.push(card);
            cards = cards.filter(c => c.id !== id);

            saveTrashedCards();
            saveCards();
            renderCards();
            updateStats();
            showNotification('🗑️ 카드가 휴지통으로 이동되었습니다.');
        }
    }
}

// 휴지통 모달 열기
function openTrashModal() {
    trashModal.classList.remove('hidden');
    renderTrashCards();
}

// 휴지통 모달 닫기
function closeTrashModalFn() {
    trashModal.classList.add('hidden');
}

// 휴지통 카드 렌더링
function renderTrashCards() {
    const trashList = document.getElementById('trashList');

    if (trashedCards.length === 0) {
        trashList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">휴지통이 비어있습니다.</p>';
        return;
    }

    trashList.innerHTML = '';

    trashedCards.forEach(card => {
        const item = document.createElement('div');
        item.className = 'trash-item';

        item.innerHTML = `
            <div class="trash-card-info">
                <strong class="trash-card-word">${card.word}</strong>
                <p class="trash-card-meaning">${card.meaning.substring(0, 60)}...</p>
            </div>
            <div class="trash-card-actions">
                <button onclick="restoreCard(${card.id})" class="trash-restore-btn">
                    ♻️ 복구
                </button>
                <button onclick="permanentlyDeleteCard(${card.id})" class="trash-delete-btn">
                    ❌ 영구 삭제
                </button>
            </div>
        `;

        trashList.appendChild(item);
    });
}

// 카드 복구
function restoreCard(id) {
    const card = trashedCards.find(c => c.id === id);
    if (card) {
        // 복구
        cards.push(card);
        trashedCards = trashedCards.filter(c => c.id !== id);

        saveCards();
        saveTrashedCards();
        renderCards();
        renderTrashCards();
        updateStats();
        showNotification('♻️ 카드가 복구되었습니다.');
    }
}

// 영구 삭제
function permanentlyDeleteCard(id) {
    if (confirm('정말로 영구 삭제하시겠습니까? 복구할 수 없습니다!')) {
        // 휴지통에서 제거
        trashedCards = trashedCards.filter(c => c.id !== id);

        // 영구 삭제 ID에 추가
        saveDeletedCardId(id);
        saveTrashedCards();
        renderTrashCards();
        showNotification('❌ 카드가 영구 삭제되었습니다.');
    }
}

// 통계 로드
function loadStats() {
    const stored = localStorage.getItem('vocabularyStats');
    if (stored) {
        stats = JSON.parse(stored);
    }
}

// 통계 저장
function saveStats() {
    localStorage.setItem('vocabularyStats', JSON.stringify(stats));
}

// 통계 업데이트
function updateStats() {
    const srsStats = srsManager ? srsManager.getStatistics(cards) : {
        new: 0, learning: 0, mastered: 0, dueToday: 0
    };

    document.getElementById('totalCards').textContent = cards.length;
    document.getElementById('favoriteCards').textContent = cards.filter(c => c.favorite).length;
    document.getElementById('reviewedCards').textContent = stats.totalReviews || 0;
    document.getElementById('masteredCards').textContent = srsStats.mastered;
    document.getElementById('dueCards').textContent = srsStats.dueToday;
    document.getElementById('streakDays').textContent = (stats.streakDays || 0) + '일';
}

// 연속 학습일 업데이트
function updateStreak() {
    const today = new Date().toDateString();
    const lastStudy = stats.lastStudyDate ? new Date(stats.lastStudyDate).toDateString() : null;

    if (lastStudy === today) {
        // 이미 오늘 공부함
        return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastStudy === yesterdayStr) {
        // 어제 공부함 - 연속 증가
        stats.streakDays = (stats.streakDays || 0) + 1;
    } else if (lastStudy === null) {
        // 처음 공부
        stats.streakDays = 1;
    } else {
        // 연속 끊김
        stats.streakDays = 1;
    }

    stats.lastStudyDate = new Date().toISOString();
    stats.studyDays = (stats.studyDays || 0) + 1;
    saveStats();
    updateStats();
}

// 복습 완료 시 통계 업데이트
function incrementReviewCount() {
    stats.totalReviews = (stats.totalReviews || 0) + 1;
    updateStreak();
    saveStats();
    updateStats();
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

    // SRS 평가 버튼
    document.querySelectorAll('.rating-btn').forEach(btn => {
        btn.onclick = () => {
            const rating = parseInt(btn.dataset.rating);
            rateCard(card, rating);
        };
    });

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
            exitReviewMode();
        }
    };

    document.getElementById('shuffleBtn').onclick = () => {
        shuffleArray(reviewCards);
        currentReviewIndex = 0;
        renderReviewCard();
        showNotification('🔀 카드 순서를 섞었습니다.');
    };
}

// 카드 평가
function rateCard(card, quality) {
    // SRS 알고리즘으로 다음 복습 시간 계산
    card.state = srsManager.calculateNextReview(card, quality);

    // 카드 배열에서 업데이트
    const cardIndex = cards.findIndex(c => c.id === card.id);
    if (cardIndex !== -1) {
        cards[cardIndex] = card;
        saveCards();
    }

    // 통계 업데이트
    incrementReviewCount();

    // 다음 카드로
    if (currentReviewIndex < reviewCards.length - 1) {
        currentReviewIndex++;
        renderReviewCard();
    } else {
        showNotification('🎉 모든 카드를 복습했습니다!');
        exitReviewMode();
    }
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

// ==================== 모바일 퍼스트 기능 ====================

// 탭 네비게이션 초기화
function initTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // 모든 탭 비활성화
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // 선택한 탭 활성화
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');

            // 홈 탭이면 스와이퍼 업데이트
            if (targetTab === 'homeTab') {
                renderSwiper();
            }
        });
    });
}

// 스와이퍼 초기화
function initSwiper() {
    const swiperContainer = document.getElementById('swiperContainer');
    const prevBtn = document.getElementById('prevCardBtnMobile');
    const nextBtn = document.getElementById('nextCardBtnMobile');

    if (!swiperContainer) return;

    // 터치 이벤트 (모바일)
    swiperContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    swiperContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    swiperContainer.addEventListener('touchend', handleTouchEnd);

    // 마우스 이벤트 (PC)
    swiperContainer.addEventListener('mousedown', handleMouseDown);
    swiperContainer.addEventListener('mousemove', handleMouseMove);
    swiperContainer.addEventListener('mouseup', handleMouseUp);
    swiperContainer.addEventListener('mouseleave', handleMouseUp);

    // 버튼 이벤트
    if (prevBtn) prevBtn.addEventListener('click', () => navigateCard(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateCard(1));

    // 키보드 이벤트 (PC)
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('homeTab').classList.contains('active')) {
            if (e.key === 'ArrowLeft') navigateCard(-1);
            if (e.key === 'ArrowRight') navigateCard(1);
            if (e.key === ' ') {
                e.preventDefault();
                const currentCard = swiperContainer.querySelector('.swipe-card');
                if (currentCard) currentCard.click();
            }
        }
    });

    // 초기 렌더링
    renderSwiper();
}

// 스와이퍼 렌더링
function renderSwiper() {
    const swiperContainer = document.getElementById('swiperContainer');
    const emptyState = document.getElementById('emptyState');
    const currentIndexSpan = document.getElementById('currentCardIndex');
    const totalCountSpan = document.getElementById('totalCardCount');

    if (!swiperContainer) return;

    const filteredCards = getFilteredCards();

    if (filteredCards.length === 0) {
        swiperContainer.innerHTML = '';
        emptyState.classList.remove('hidden');
        totalCountSpan.textContent = '0';
        return;
    }

    emptyState.classList.add('hidden');

    // 인덱스 범위 체크
    if (currentSwipeIndex >= filteredCards.length) {
        currentSwipeIndex = 0;
    }
    if (currentSwipeIndex < 0) {
        currentSwipeIndex = filteredCards.length - 1;
    }

    const card = filteredCards[currentSwipeIndex];

    // 진행도 업데이트
    currentIndexSpan.textContent = currentSwipeIndex + 1;
    totalCountSpan.textContent = filteredCards.length;

    // 카드 렌더링
    swiperContainer.innerHTML = createSwipeCard(card);

    // 카드 클릭으로 뒤집기
    const cardElement = swiperContainer.querySelector('.flashcard');
    if (cardElement) {
        cardElement.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-btn') && !e.target.closest('.delete-btn')) {
                cardElement.classList.toggle('flipped');
            }
        });
    }
}

// 스와이프 카드 HTML 생성
function createSwipeCard(card) {
    const categoryBadges = card.categories && card.categories.length > 0
        ? card.categories.map(catName => {
            const cat = categories.find(c => c.name === catName);
            return cat ? `<span style="background: ${cat.color}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; margin-right: 5px;">${cat.icon} ${cat.name}</span>` : '';
        }).join('')
        : '';

    return `
        <div class="flashcard swipe-card">
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    <div class="card-actions">
                        <button class="favorite-btn ${card.isFavorite ? 'active' : ''}" onclick="toggleFavorite(${card.id}); event.stopPropagation();">
                            ${card.isFavorite ? '⭐' : '☆'}
                        </button>
                        <button class="delete-btn" onclick="deleteCard(${card.id}); event.stopPropagation();">🗑️</button>
                    </div>
                    <div class="word-display">
                        <div class="word">${card.word}</div>
                        ${card.partOfSpeech ? `<div class="part-of-speech">${card.partOfSpeech}</div>` : ''}
                    </div>
                    ${card.pronunciation ? `<div class="pronunciation">[${card.pronunciation}]</div>` : ''}
                    <button class="speaker-btn" onclick="speakWord('${card.word}'); event.stopPropagation();">🔊</button>
                    <div class="flip-hint">카드를 클릭하여 뒷면 보기</div>
                </div>
                <div class="flashcard-back" onclick="event.stopPropagation();">
                    ${card.koreanWord ? `<div class="korean-word-display">${card.koreanWord}</div>` : ''}
                    <div class="card-content">
                        <h3>📖 의미</h3>
                        <p>${card.meaning}</p>
                        ${card.example ? `<h3>💬 예문</h3><p>${card.example}</p>` : ''}
                        ${card.relatedWords ? `<h3>🔗 관련 단어</h3><p>${card.relatedWords}</p>` : ''}
                        ${card.tips ? `<h3>💡 팁 & 기억법</h3><p>${card.tips}</p>` : ''}
                        ${categoryBadges ? `<div style="margin-top: 20px;">${categoryBadges}</div>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 카드 네비게이션
function navigateCard(direction) {
    const filteredCards = getFilteredCards();
    if (filteredCards.length === 0) return;

    currentSwipeIndex += direction;

    // 순환 네비게이션
    if (currentSwipeIndex >= filteredCards.length) {
        currentSwipeIndex = 0;
    }
    if (currentSwipeIndex < 0) {
        currentSwipeIndex = filteredCards.length - 1;
    }

    renderSwiper();
}

// 터치 이벤트 핸들러
function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = true;
}

function handleTouchMove(e) {
    if (!isSwiping) return;

    touchCurrentX = e.touches[0].clientX;
    touchCurrentY = e.touches[0].clientY;

    const diffX = touchCurrentX - touchStartX;
    const diffY = touchCurrentY - touchStartY;

    // 수평 스와이프가 수직 스와이프보다 크면
    if (Math.abs(diffX) > Math.abs(diffY)) {
        e.preventDefault(); // 세로 스크롤 방지

        const card = e.currentTarget.querySelector('.swipe-card');
        if (card) {
            const rotation = diffX / 20;
            card.style.transform = `translateX(${diffX}px) rotate(${rotation}deg)`;
            card.style.transition = 'none';
        }
    }
}

function handleTouchEnd(e) {
    if (!isSwiping) return;
    isSwiping = false;

    const diffX = touchCurrentX - touchStartX;
    const card = e.currentTarget.querySelector('.swipe-card');

    if (card) {
        // 스와이프 거리가 충분하면 카드 넘기기
        if (Math.abs(diffX) > 100) {
            if (diffX > 0) {
                // 오른쪽 스와이프: 다음 카드
                navigateCard(1);
            } else {
                // 왼쪽 스와이프: 이전 카드
                navigateCard(-1);
            }
        } else {
            // 원위치
            card.style.transform = '';
            card.style.transition = 'transform 0.3s ease';
        }
    }

    touchStartX = 0;
    touchCurrentX = 0;
}

// 마우스 이벤트 핸들러 (PC 드래그)
function handleMouseDown(e) {
    touchStartX = e.clientX;
    touchStartY = e.clientY;
    isSwiping = true;
    e.currentTarget.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
    if (!isSwiping) return;

    touchCurrentX = e.clientX;
    touchCurrentY = e.clientY;

    const diffX = touchCurrentX - touchStartX;
    const diffY = touchCurrentY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        const card = e.currentTarget.querySelector('.swipe-card');
        if (card) {
            const rotation = diffX / 20;
            card.style.transform = `translateX(${diffX}px) rotate(${rotation}deg)`;
            card.style.transition = 'none';
        }
    }
}

function handleMouseUp(e) {
    if (!isSwiping) return;
    isSwiping = false;

    e.currentTarget.style.cursor = 'grab';

    const diffX = touchCurrentX - touchStartX;
    const card = e.currentTarget.querySelector('.swipe-card');

    if (card) {
        if (Math.abs(diffX) > 100) {
            if (diffX > 0) {
                navigateCard(1);
            } else {
                navigateCard(-1);
            }
        } else {
            card.style.transform = '';
            card.style.transition = 'transform 0.3s ease';
        }
    }

    touchStartX = 0;
    touchCurrentX = 0;
}

// 필터된 카드 가져오기 (기존 로직 활용)
function getFilteredCards() {
    let filtered = cards.filter(card => {
        // 검색 필터
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const matchesSearch = !searchTerm ||
            card.word.toLowerCase().includes(searchTerm) ||
            card.meaning.toLowerCase().includes(searchTerm) ||
            (card.koreanWord && card.koreanWord.toLowerCase().includes(searchTerm));

        // 기타 필터
        if (currentFilter === 'favorites' && !card.isFavorite) return false;
        if (currentFilter === 'due' && !isDueForReview(card)) return false;

        // 카테고리 필터
        if (selectedCategories.length > 0) {
            const hasCategory = card.categories && card.categories.some(cat =>
                selectedCategories.includes(cat)
            );
            if (!hasCategory) return false;
        }

        return matchesSearch;
    });

    return filtered;
}

// 카드 섞기
function shuffleCards() {
    const filteredCards = getFilteredCards();
    if (filteredCards.length === 0) return;

    // 현재 필터된 카드들을 섞음
    shuffleArray(filteredCards);

    // 첫 카드로 이동
    currentSwipeIndex = 0;
    renderSwiper();

    showNotification('🔀 카드가 섞였습니다!');

    // 햅틱 피드백 (지원되는 경우)
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// 카드 팝업 초기화
function initCardPopup() {
    const cardPopup = document.getElementById('cardPopup');
    const closeBtn = document.getElementById('closeCardPopup');

    if (!cardPopup || !closeBtn) return;

    // 닫기 버튼
    closeBtn.addEventListener('click', closeCardPopup);

    // 배경 클릭 시 닫기
    cardPopup.addEventListener('click', (e) => {
        if (e.target === cardPopup) {
            closeCardPopup();
        }
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cardPopup.classList.contains('active')) {
            closeCardPopup();
        }
    });
}

// 카드 팝업 열기
function openCardPopup(cardId) {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const cardPopup = document.getElementById('cardPopup');
    const cardPopupContent = document.getElementById('cardPopupContent');

    // 카드 HTML 생성 (큰 크기)
    cardPopupContent.innerHTML = createPopupCard(card);

    // 팝업 표시
    cardPopup.classList.add('active');

    // 카드 클릭으로 뒤집기
    const cardElement = cardPopupContent.querySelector('.flashcard');
    if (cardElement) {
        cardElement.addEventListener('click', (e) => {
            if (!e.target.closest('.favorite-btn') && !e.target.closest('.delete-btn') && !e.target.closest('.speaker-btn')) {
                cardElement.classList.toggle('flipped');
            }
        });
    }

    // body 스크롤 방지
    document.body.style.overflow = 'hidden';
}

// 카드 팝업 닫기
function closeCardPopup() {
    const cardPopup = document.getElementById('cardPopup');
    cardPopup.classList.remove('active');

    // body 스크롤 복원
    document.body.style.overflow = '';

    // 애니메이션 후 내용 제거
    setTimeout(() => {
        document.getElementById('cardPopupContent').innerHTML = '';
    }, 300);
}

// 팝업용 카드 HTML 생성
function createPopupCard(card) {
    const categoryBadges = card.categories && card.categories.length > 0
        ? card.categories.map(catName => {
            const cat = categories.find(c => c.name === catName);
            return cat ? `<span style="background: ${cat.color}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; margin-right: 5px;">${cat.icon} ${cat.name}</span>` : '';
        }).join('')
        : '';

    return `
        <div class="flashcard">
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    <div class="card-actions">
                        <button class="favorite-btn ${card.isFavorite ? 'active' : ''}" onclick="toggleFavorite(${card.id}); event.stopPropagation();">
                            ${card.isFavorite ? '⭐' : '☆'}
                        </button>
                        <button class="delete-btn" onclick="deleteCard(${card.id}); closeCardPopup(); event.stopPropagation();">🗑️</button>
                    </div>
                    <div class="word-display">
                        <div class="word">${card.word}</div>
                        ${card.partOfSpeech ? `<div class="part-of-speech">${card.partOfSpeech}</div>` : ''}
                    </div>
                    ${card.pronunciation ? `<div class="pronunciation">[${card.pronunciation}]</div>` : ''}
                    <button class="speaker-btn" onclick="speakWord('${card.word}'); event.stopPropagation();">🔊</button>
                    <div class="flip-hint">카드를 클릭하여 뒷면 보기</div>
                </div>
                <div class="flashcard-back" onclick="event.stopPropagation();">
                    ${card.koreanWord ? `<div class="korean-word-display">${card.koreanWord}</div>` : ''}
                    <div class="card-content">
                        <h3>📖 의미</h3>
                        <p>${card.meaning}</p>
                        ${card.example ? `<h3>💬 예문</h3><p>${card.example}</p>` : ''}
                        ${card.relatedWords ? `<h3>🔗 관련 단어</h3><p>${card.relatedWords}</p>` : ''}
                        ${card.tips ? `<h3>💡 팁 & 기억법</h3><p>${card.tips}</p>` : ''}
                        ${categoryBadges ? `<div style="margin-top: 20px;">${categoryBadges}</div>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}
