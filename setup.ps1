# ============================================================================
# 8-BIT DOPAMINE - one-time setup on Windows (PowerShell)
# Prereqs: git, GitHub CLI (`gh auth login` da chay), Node >= 20
# Usage:  giai nen repo vao E:\8bit-dopamine roi chay script nay tu do
# ============================================================================

$ErrorActionPreference = "Stop"
Set-Location E:\8bit-dopamine

# ---- 0. DOI PLACEHOLDER (bat buoc truoc khi publish) -----------------------
#   @yourscope  -> npm username/org cua ban (vd: @zenn)
#   YOURUSER    -> GitHub username (repository field - provenance yeu cau khop)
$NPM_SCOPE  = Read-Host "npm scope (khong co @, vd: zenn)"
$GH_USER    = Read-Host "GitHub username"
(Get-Content package.json -Raw) `
  -replace "@yourscope", "@$NPM_SCOPE" `
  -replace "YOURUSER", $GH_USER | Set-Content package.json -NoNewline
(Get-Content LICENSE -Raw) -replace "YOURUSER", $GH_USER | Set-Content LICENSE -NoNewline

# ---- 1. Git init (Windows-safe: LF qua .gitattributes) ---------------------
git init -b main
git config core.longpaths true
git config core.autocrlf false   # .gitattributes da chuan hoa LF

# ---- 2. Toolchain -----------------------------------------------------------
corepack enable                   # dung dung pnpm version tu "packageManager"
pnpm install
pnpm check                        # lint + syntax phai xanh

# ---- 3. Commit + tao GitHub repo -------------------------------------------
git add -A
git commit -m "feat: 8-bit dopamine design system v0.1.0"
gh repo create "8bit-dopamine" --public --source=. --remote=origin --push

# ---- 4. npm auth cho CI (chon 1 trong 2) ------------------------------------
# A) Token (nhanh): npmjs.com -> Access Tokens -> Generate (Automation) -> paste:
gh secret set NPM_TOKEN
# B) (khuyen dung, khong can token) Trusted Publishing OIDC:
#    npmjs.com -> package Settings -> Trusted Publisher
#    -> GitHub: repo "$GH_USER/8bit-dopamine", workflow "release.yml"
#    Sau do xoa dong NODE_AUTH_TOKEN trong .github/workflows/release.yml

# ---- 5. Release dau tien -----------------------------------------------------
git tag v0.1.0
git push --follow-tags            # -> GitHub Action tu publish len npm + provenance

Write-Host ""
Write-Host "DONE. Kiem tra: https://github.com/$GH_USER/8bit-dopamine/actions" -ForegroundColor Green
Write-Host "Package se o:   https://www.npmjs.com/package/@$NPM_SCOPE/8bit-dopamine" -ForegroundColor Green
Write-Host ""
Write-Host "Release lan sau: sua version trong package.json -> commit ->"
Write-Host "  git tag vX.Y.Z ; git push --follow-tags"
