package com.example.pmsauth.auth;

import com.example.pmsauth.jwt.JwtUtil;
import com.example.pmsauth.user.User;
import com.example.pmsauth.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public SignupResponse signup(SignupRequest request) {
        if (userRepository.existsByLoginId(request.loginId())) {
            throw new AuthException("이미 사용 중인 아이디입니다.");
        }

        User user = new User(
                request.name(),
                request.loginId(),
                passwordEncoder.encode(request.password())
        );
        User saved = userRepository.save(user);

        return new SignupResponse(saved.getUserId(), saved.getName(), saved.getLoginId());
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByLoginId(request.loginId())
                .orElseThrow(() -> new AuthException("아이디 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new AuthException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        // UUID 세션 → JWT 발급
        String token = jwtUtil.generateToken(user.getUserId(), user.getLoginId());

        return new LoginResponse(user.getUserId(), user.getName(), token, "로그인 성공");
    }

    public LogoutResponse logout(LogoutRequest request) {
        // JWT는 stateless — 클라이언트에서 토큰을 버리면 됨
        // 토큰 형식만 검증 (만료/위조 토큰으로 로그아웃 시도 방지)
        try {
            jwtUtil.validateToken(request.token());
        } catch (Exception e) {
            throw new AuthException("유효하지 않은 토큰입니다.");
        }
        return new LogoutResponse("로그아웃 성공");
    }
}
