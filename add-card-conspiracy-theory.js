// '음모론 (conspiracy theory)' 카드를 웹사이트에 추가하는 코드
// 사용법: 웹사이트에서 F12를 눌러 콘솔을 열고 이 코드를 복사해서 붙여넣기 후 Enter!

(function() {
    const newCard = {
        id: Date.now(),
        word: 'conspiracy theory',
        pronunciation: '컨스피러시 씨어리',
        meaning: '어떤 사건이나 상황이 비밀스러운 집단이나 조직의 계획적인 음모에 의해 일어났다고 믿는 이론이나 설명',
        example: `Some people believe in conspiracy theories about the moon landing.
→ 어떤 사람들은 달 착륙에 대한 음모론을 믿는다.

The internet has made it easier for conspiracy theories to spread quickly.
→ 인터넷은 음모론이 빠르게 퍼지는 것을 더 쉽게 만들었다.`,
        related: `유의어: alternative explanation, speculation
관련어: conspiracy theorist (음모론자), conspirator (공모자), debunk (반박하다)`,
        tips: `어원: 라틴어 conspirare (함께 숨을 쉬다, 함께 계획하다)
- con- (함께) + spirare (숨쉬다)

기억법: 비밀 모임에서 "함께 속삭인다" → 음모론!

사용 팁:
- 대체로 부정적인 의미로 사용됨
- believe in conspiracy theories (음모론을 믿다)
- spread conspiracy theories (음모론을 퍼뜨리다)`,
        favorite: false,
        createdAt: Date.now()
    };

    // 기존 카드 가져오기
    let cards = JSON.parse(localStorage.getItem('vocabularyCards') || '[]');

    // 중복 확인 (이미 같은 단어가 있는지)
    const exists = cards.some(card => card.word.toLowerCase() === newCard.word.toLowerCase());

    if (exists) {
        console.log('⚠️  이미 "' + newCard.word + '" 카드가 존재합니다!');
        return;
    }

    // 카드 추가 (맨 앞에)
    cards.unshift(newCard);

    // 저장
    localStorage.setItem('vocabularyCards', JSON.stringify(cards));

    console.log('✅ "' + newCard.word + '" 카드가 추가되었습니다!');
    console.log('페이지를 새로고침하면 카드가 보입니다.');

    // 자동 새로고침
    setTimeout(() => {
        location.reload();
    }, 1000);
})();
