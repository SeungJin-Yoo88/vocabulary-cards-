/**
 * SRS (Spaced Repetition System) Engine
 * Simplified SM-2 algorithm implementation
 */

class SRSManager {
    constructor() {
        this.intervals = {
            again: 1,      // 1 day - "다시 학습" (quality < 3)
            hard: 3,       // 3 days - "어려움" (quality = 3)
            good: 7,       // 7 days - "보통" (quality = 4)
            easy: 14       // 14 days - "쉬움" (quality = 5)
        };
    }

    /**
     * 카드의 다음 복습 시간 계산
     * @param {Object} card - 카드 객체
     * @param {Number} quality - 난이도 (1-5)
     * @returns {Object} - 업데이트된 state
     */
    calculateNextReview(card, quality) {
        if (!card.state) {
            card.state = this.initializeState();
        }

        const state = { ...card.state };
        state.reviewCount += 1;
        state.lastReviewed = Date.now();

        let interval = 0;

        if (quality < 3) {
            // "다시 학습" - 1일 후
            interval = this.intervals.again;
            state.status = 'learning';
        } else if (quality === 3) {
            // "어려움" - 3일 후
            interval = this.intervals.hard;
            state.status = 'learning';
        } else if (quality === 4) {
            // "보통" - 7일 후
            interval = this.intervals.good;
            state.correctCount += 1;

            if (state.reviewCount >= 3 && state.correctCount >= 2) {
                state.status = 'mastered';
            } else {
                state.status = 'learning';
            }
        } else {
            // "쉬움" - 14일 후
            interval = this.intervals.easy;
            state.correctCount += 1;

            if (state.reviewCount >= 2 && state.correctCount >= 2) {
                state.status = 'mastered';
            } else {
                state.status = 'learning';
            }
        }

        // 복습 횟수가 증가할수록 간격 증가 (최대 60일)
        if (quality >= 4 && state.reviewCount > 3) {
            interval = Math.min(
                Math.round(interval * Math.pow(1.5, state.reviewCount - 3)),
                60
            );
        }

        state.nextReview = Date.now() + (interval * 24 * 60 * 60 * 1000);

        return state;
    }

    /**
     * 새 카드의 초기 state 생성
     */
    initializeState() {
        return {
            status: 'new',           // new, learning, mastered
            reviewCount: 0,
            correctCount: 0,
            lastReviewed: null,
            nextReview: Date.now()   // 즉시 복습 가능
        };
    }

    /**
     * 복습이 필요한 카드 필터링
     * @param {Array} cards - 전체 카드 배열
     * @returns {Array} - 복습 필요한 카드 배열
     */
    getDueCards(cards) {
        const now = Date.now();
        return cards.filter(card => {
            if (!card.state) {
                return true; // 새 카드는 항상 복습 대상
            }
            return !card.state.nextReview || card.state.nextReview <= now;
        });
    }

    /**
     * 카드 상태별 통계
     * @param {Array} cards - 전체 카드 배열
     * @returns {Object} - 통계 객체
     */
    getStatistics(cards) {
        const stats = {
            new: 0,
            learning: 0,
            mastered: 0,
            dueToday: 0
        };

        const now = Date.now();

        cards.forEach(card => {
            if (!card.state || card.state.status === 'new') {
                stats.new += 1;
            } else if (card.state.status === 'learning') {
                stats.learning += 1;
            } else if (card.state.status === 'mastered') {
                stats.mastered += 1;
            }

            if (!card.state || !card.state.nextReview || card.state.nextReview <= now) {
                stats.dueToday += 1;
            }
        });

        return stats;
    }

    /**
     * 다음 복습까지 남은 시간을 사람이 읽기 쉬운 형식으로 변환
     * @param {Number} timestamp - 다음 복습 시간 (밀리초)
     * @returns {String} - 예: "2일 후", "3시간 후"
     */
    getTimeUntilReview(timestamp) {
        if (!timestamp) return '지금';

        const now = Date.now();
        const diff = timestamp - now;

        if (diff <= 0) return '지금';

        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        const hours = Math.floor(diff / (60 * 60 * 1000));
        const minutes = Math.floor(diff / (60 * 1000));

        if (days > 0) return `${days}일 후`;
        if (hours > 0) return `${hours}시간 후`;
        if (minutes > 0) return `${minutes}분 후`;
        return '곧';
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SRSManager;
}
