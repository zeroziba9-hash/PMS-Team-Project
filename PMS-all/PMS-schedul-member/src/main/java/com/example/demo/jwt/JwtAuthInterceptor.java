package com.example.demo.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class JwtAuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        // OPTIONS (CORS preflight)는 통과
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"인증 토큰이 필요합니다.\"}");
            return false;
        }

        String token = authHeader.substring(7); // "Bearer " 제거

        try {
            Claims claims = jwtUtil.validateToken(token);
            Integer userId = Integer.valueOf(claims.getSubject());
            String loginId = claims.get("loginId", String.class);

            // 컨트롤러에서 사용할 수 있도록 request attribute에 저장
            request.setAttribute("userId", userId);
            request.setAttribute("loginId", loginId);
            return true;

        } catch (JwtException | IllegalArgumentException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\":\"유효하지 않거나 만료된 토큰입니다.\"}");
            return false;
        }
    }
}
