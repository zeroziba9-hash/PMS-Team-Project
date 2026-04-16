package com.example.pmsauth.auth;

import com.example.pmsauth.user.User;
import com.example.pmsauth.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // MVP 세션 토큰 저장소 (추후 JWT/Redis로 교체)
    private final Map<String, Long> sessionStore = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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

        String token = UUID.randomUUID().toString();
        sessionStore.put(token, user.getUserId());

        return new LoginResponse(user.getUserId(), user.getName(), token, "로그인 성공");
    }

    public LogoutResponse logout(LogoutRequest request) {
        Long removed = sessionStore.remove(request.token());
        if (removed == null) {
            throw new AuthException("유효하지 않은 토큰입니다.");
        }
        return new LogoutResponse("로그아웃 성공");
    }
}
