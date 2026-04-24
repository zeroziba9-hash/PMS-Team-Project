@REM Maven Wrapper Script (fixed)
@echo off
@setlocal enabledelayedexpansion

set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6-bin\apache-maven-3.9.6
set MAVEN_ZIP_PATH=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6-bin\maven.zip
set MAVEN_DIST_PATH=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6-bin

if exist "!MAVEN_HOME!\bin\mvn.cmd" (
    echo Maven found. Starting...
    "!MAVEN_HOME!\bin\mvn.cmd" %*
    goto :eof
)

echo Maven not found. Downloading Maven 3.9.6...
if not exist "!MAVEN_DIST_PATH!" mkdir "!MAVEN_DIST_PATH!"

powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip' -OutFile '!MAVEN_ZIP_PATH!'"

if not exist "!MAVEN_ZIP_PATH!" (
    echo Download failed! Check your internet connection.
    exit /b 1
)

echo Extracting Maven...
powershell -NoProfile -Command "Expand-Archive -Path '!MAVEN_ZIP_PATH!' -DestinationPath '!MAVEN_DIST_PATH!' -Force"
if exist "!MAVEN_ZIP_PATH!" del "!MAVEN_ZIP_PATH!"

if exist "!MAVEN_HOME!\bin\mvn.cmd" (
    echo Maven ready!
    "!MAVEN_HOME!\bin\mvn.cmd" %*
) else (
    echo Maven extraction failed. Please install Maven manually.
    exit /b 1
)

@endlocal
