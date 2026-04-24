@echo off
cd /d "C:\Users\ASUS\Desktop\PMS Team\PMS-Team-Project"

if exist .git\index.lock del /f .git\index.lock

git config user.name "zeroziba9-hash"
git config user.email "zeroziba9@gmail.com"

git add -A
git commit -m "feat: JWT auth, kanban, calendar, comments, file-upload, member-management, DB spec PPT"

git branch develop
git branch feature/jwt-auth
git branch feature/kanban-calendar
git branch feature/comments-fileupload
git branch feature/member-management
git branch feature/ui-redesign
git branch release/v1.0

git tag -a v1.0.0 -m "PMS final release - K-Digital Training"

git push origin main
git push origin develop
git push origin feature/jwt-auth
git push origin feature/kanban-calendar
git push origin feature/comments-fileupload
git push origin feature/member-management
git push origin feature/ui-redesign
git push origin release/v1.0
git push origin v1.0.0

echo.
echo Done! Check: https://github.com/zeroziba9-hash/PMS-Team-Project
echo.
pause
