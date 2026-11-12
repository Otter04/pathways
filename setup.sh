#!/usr/bin/env bash
# One-time bootstrap on the user's machine. No tokens are printed or sent to ChatGPT.
# Creates ONLY Otter04/pathways; never repurposes another repository.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
OWNER='Otter04'
REPO="$OWNER/pathways"
fail(){ printf '\n중단: %s\n' "$*" >&2; exit 1; }
trap 'printf "\n설정이 중단되었습니다. 위 오류를 확인하세요. 완료라고 간주하지 마세요.\n" >&2' ERR
for tool in git curl; do
  command -v "$tool" >/dev/null 2>&1 || fail "$tool 명령이 필요합니다."
done
git --version >/dev/null 2>&1 || fail 'Git / Command Line Tools 설치를 먼저 완료하세요.'
if ! command -v gh >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    printf 'GitHub CLI가 없습니다. Homebrew로 gh를 설치할까요? [y/N] '
    read -r install
    [[ "$install" = y || "$install" = Y ]] || fail '설치하지 않았습니다. gh 설치 후 다시 실행하세요.'
    brew install gh
  else
    fail 'GitHub CLI(gh)를 먼저 설치하세요. 설치 안내: https://cli.github.com/'
  fi
fi
printf '\nPATHWAYS 최초 온라인 연결\n대상: %s (새 공개 저장소)\n공개 내용: 사이트 코드와 공개 채용공고 요약·출처\n개인 메모·북마크·지원서·토큰은 업로드하지 않습니다.\n\n' "$REPO"
if ! gh auth status --hostname github.com >/dev/null 2>&1; then
  gh auth login --hostname github.com --web --git-protocol https
fi
LOGIN="$(gh api user --jq .login)"
[[ "$(printf '%s' "$LOGIN" | tr '[:upper:]' '[:lower:]')" = 'otter04' ]] || fail "현재 로그인은 $LOGIN 입니다. Otter04로 전환한 다음 다시 실행하세요."
LOCAL_MARKER="$(git hash-object "$ROOT/pathways-project.json")"
EXISTS=false
if gh repo view "$REPO" --json name >/dev/null 2>&1; then
  EXISTS=true
  REMOTE_MARKER="$(gh api "repos/$REPO/contents/pathways-project.json?ref=main" --jq .sha 2>/dev/null || true)"
  [[ "$REMOTE_MARKER" = "$LOCAL_MARKER" ]] || fail '같은 이름의 저장소가 있지만 PATHWAYS 배포 표식이 다릅니다. 기존 내용을 덮어쓰지 않았습니다.'
  printf '이 패키지로 생성된 저장소를 확인했습니다. 기존 최신 데이터는 덮어쓰지 않습니다.\n'
fi
if [[ "$EXISTS" = false ]]; then
  printf '위 공개 저장소를 생성하고 사이트를 공개할까요? [y/N] '
  read -r publish
  [[ "$publish" = y || "$publish" = Y ]] || fail '공개 배포를 실행하지 않았습니다.'
  cd "$ROOT"
  [[ ! -e .git ]] || fail '이 폴더에 Git 이력이 있습니다. 새로 압축을 푼 폴더에서 실행하세요.'
  git init -b main
  UID_NUM="$(gh api user --jq .id)"
  git config user.name "$LOGIN"
  git config user.email "$UID_NUM+$LOGIN@users.noreply.github.com"
  # Stage an explicit allowlist, never git add .
  git add -- docs src sources README.md setup.sh build_site.py validate_data.js test_live.js pathways-project.json .gitignore
  git commit -m 'Initialize PATHWAYS online data site'
  gh repo create "$REPO" --public --description 'PATHWAYS CS career roadmap and curated job opportunities' --source "$ROOT" --remote origin
  git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push -u origin main
fi
# On reruns, keep newer repository content and only inspect/enable the Pages source.
if PAGE_CONFIG="$(gh api "repos/$REPO/pages" --jq '(.source.branch // "") + " " + (.source.path // "")' 2>/dev/null)"; then
  [[ "$PAGE_CONFIG" = 'main /docs' ]] || fail '기존 Pages의 게시 경로가 다릅니다. 임의로 변경하지 않았습니다.'
else
  gh api --method POST "repos/$REPO/pages" -H 'Accept: application/vnd.github+json' \
    -f 'source[branch]=main' -f 'source[path]=/docs' -f 'build_type=legacy' >/dev/null
fi
URL="$(gh api "repos/$REPO/pages" --jq .html_url)"
EXPECTED="$(gh api "repos/$REPO/contents/docs/jobs-data.json?ref=main" --jq .sha)"
TEMP="$(mktemp)"
trap 'rm -f "$TEMP"' EXIT
ONLINE=false
for attempt in $(seq 1 12); do
  if curl --fail --silent --show-error --max-time 10 "${URL%/}/jobs-data.json?setup=$(date +%s)" -o "$TEMP" 2>/dev/null; then
    if [[ "$(git hash-object "$TEMP")" = "$EXPECTED" ]]; then ONLINE=true; break; fi
  fi
  sleep 5
done
if [[ "$ONLINE" = true ]]; then
  printf '\n웹 게시 데이터 확인 성공: %s\n' "$URL"
else
  printf '\n저장소 및 Pages 설정 완료. 웹 게시 검증은 아직 통과하지 못했습니다.\n'
  printf '확인할 주소: %s\n배포 상태: https://github.com/%s/actions\n' "$URL" "$REPO"
fi
printf '\n마지막 연결 확인: ChatGPT의 연결된 GitHub 앱이 %s 저장소를 읽고 쓸 수 있어야 합니다.\n' "$REPO"
printf '앱이 선택한 저장소만 접근하도록 설치되어 있다면 pathways를 접근 대상에 추가하세요.\n'
printf '이후 기존 3일 주기 예약이 docs/jobs-data.json을 갱신합니다. 이 스크립트를 반복 실행할 필요는 없습니다.\n'
printf '페이지의 서버 조회 시각은 원문 검증일이 아닙니다. 각 공고의 확인일을 확인하세요.\n'
