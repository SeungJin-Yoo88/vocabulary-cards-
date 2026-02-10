#!/usr/bin/env python3
"""
Vocabulary Cards Auto-Sync
cards.json 파일을 감시하고 브라우저에 자동으로 업데이트 알림
"""

import os
import time
import json
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading

# 파일 경로
CARDS_FILE = Path(__file__).parent / "cards.json"
PORT = 8888

class CardsFileHandler(FileSystemEventHandler):
    """cards.json 파일 변경 감지"""

    def __init__(self):
        self.last_modified = time.time()
        self.last_card_count = 0
        self.load_initial_count()

    def load_initial_count(self):
        """초기 카드 개수 로드"""
        try:
            if CARDS_FILE.exists():
                with open(CARDS_FILE, 'r', encoding='utf-8') as f:
                    cards = json.load(f)
                    self.last_card_count = len(cards)
                    print(f"📚 현재 카드 개수: {self.last_card_count}개")
        except Exception as e:
            print(f"⚠️ 초기 로드 실패: {e}")

    def on_modified(self, event):
        """파일 변경 감지 시 호출"""
        if event.src_path.endswith('cards.json'):
            # 중복 이벤트 방지 (1초 내 중복 무시)
            current_time = time.time()
            if current_time - self.last_modified < 1:
                return

            self.last_modified = current_time
            self.check_new_cards()

    def check_new_cards(self):
        """새 카드 추가 확인"""
        try:
            time.sleep(0.5)  # 파일 쓰기 완료 대기

            with open(CARDS_FILE, 'r', encoding='utf-8') as f:
                cards = json.load(f)
                current_count = len(cards)

                if current_count > self.last_card_count:
                    new_count = current_count - self.last_card_count
                    print(f"\n✨ 새 카드 감지! (+{new_count}개)")
                    print(f"📊 총 카드: {self.last_card_count}개 → {current_count}개")

                    # 새로 추가된 카드 정보 표시
                    if current_count > 0:
                        latest_card = cards[-1]
                        print(f"📝 최신 카드: {latest_card.get('word', 'Unknown')}")

                    print(f"🔄 브라우저를 새로고침하세요!")
                    print("-" * 50)

                    self.last_card_count = current_count

        except Exception as e:
            print(f"⚠️ 파일 읽기 실패: {e}")


def start_file_watcher():
    """파일 감시 시작"""
    print("=" * 50)
    print("🤖 Vocabulary Cards Auto-Sync 시작!")
    print("=" * 50)
    print(f"📁 감시 중: {CARDS_FILE}")
    print(f"💡 사용법:")
    print(f"   1. Claude Code에서 /vocab-card [단어] 실행")
    print(f"   2. cards.json이 자동으로 업데이트됨")
    print(f"   3. 브라우저 새로고침!")
    print("=" * 50)
    print()

    event_handler = CardsFileHandler()
    observer = Observer()
    observer.schedule(event_handler, path=str(CARDS_FILE.parent), recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 감시 중지...")
        observer.stop()

    observer.join()
    print("👋 종료되었습니다.")


if __name__ == "__main__":
    # 필요한 패키지 확인
    try:
        import watchdog
    except ImportError:
        print("⚠️ watchdog 패키지가 필요합니다!")
        print("설치: pip install watchdog")
        exit(1)

    # 파일 존재 확인
    if not CARDS_FILE.exists():
        print(f"⚠️ cards.json 파일을 찾을 수 없습니다: {CARDS_FILE}")
        exit(1)

    start_file_watcher()
