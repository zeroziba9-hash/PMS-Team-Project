# pms-auth-api

로그인/로그아웃/회원가입 MVP API (Spring Boot + JPA + MySQL)

## 실행

```bash
mvn spring-boot:run
```

기본 포트: `8080`

## API

### 1) 회원가입
`POST /api/auth/signup`

```json
{
  "name": "홍길동",
  "loginId": "hong123",
  "password": "1234"
}
```

### 2) 로그인
`POST /api/auth/login`

```json
{
  "loginId": "hong123",
  "password": "1234"
}
```

### 3) 로그아웃
`POST /api/auth/logout`

```json
{
  "token": "로그인 시 받은 token"
}
```

## DB

`src/main/resources/application.yml`의 datasource 계정을 로컬 환경에 맞게 변경하세요.
