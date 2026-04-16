"""
public/cats/ 内の 001.png〜100.png の背景を rembg で透過化するスクリプト。

使い方:
    pip install rembg[cpu] pillow
    python remove_bg.py
"""

from pathlib import Path
import shutil
import sys
import traceback

# Windows コンソール (cp932) で絵文字を出せるように UTF-8 に切り替え
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from rembg import remove, new_session

ROOT = Path(__file__).resolve().parent
CATS_DIR = ROOT / "public" / "cats"
BACKUP_DIR = CATS_DIR / "originals"


def main() -> int:
    if not CATS_DIR.is_dir():
        print(f"ERROR: {CATS_DIR} が見つかりません", file=sys.stderr)
        return 1

    BACKUP_DIR.mkdir(exist_ok=True)

    targets = sorted(p for p in CATS_DIR.glob("*.png") if p.stem.isdigit())
    if not targets:
        print("処理対象の PNG がありません")
        return 0

    total = len(targets)
    session = new_session("u2net")

    success = 0
    failed: list[tuple[str, str]] = []

    for i, src in enumerate(targets, start=1):
        tag = f"[{i:02d}/{total}]"
        try:
            backup = BACKUP_DIR / src.name
            if not backup.exists():
                shutil.copy2(src, backup)

            with open(src, "rb") as f:
                input_bytes = f.read()

            output_bytes = remove(input_bytes, session=session)

            with open(src, "wb") as f:
                f.write(output_bytes)

            print(f"{tag} {src.name} ✅", flush=True)
            success += 1
        except Exception as e:
            print(f"{tag} {src.name} ❌ {e}", flush=True)
            traceback.print_exc()
            failed.append((src.name, str(e)))

    print()
    print("=" * 40)
    print(f"完了: 成功 {success} / 失敗 {len(failed)} / 合計 {total}")
    if failed:
        print("失敗したファイル:")
        for name, err in failed:
            print(f"  - {name}: {err}")
    print(f"オリジナルのバックアップ: {BACKUP_DIR}")
    print("=" * 40)
    return 0 if not failed else 2


if __name__ == "__main__":
    sys.exit(main())
