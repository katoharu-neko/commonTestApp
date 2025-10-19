package com.example.commonTestApp.config;

import java.io.IOException;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * フロントのクライアントサイドルーティング用フォールバック。
 * /api, /v3, /swagger-ui, /actuator, /static, /assets, 拡張子付き( .js .css など ) は除外し、
 * その他のパスを /index.html に内部フォワードします。
 *
 * ViewControllerRegistry の正規表現マッピングは PathPattern でエラーになるため使用しません。
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class SpaFallbackFilter extends OncePerRequestFilter {

    private boolean isApiOrDoc(String path) {
        return path.startsWith("/api")
                || path.startsWith("/v3")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/actuator");
    }

    private boolean isStaticAsset(String path) {
        // Spring Boot は classpath:/static を / にマッピングする
        // 典型的なビルド成果物や静的配下っぽいものは素通し
        return path.startsWith("/static")
                || path.startsWith("/assets")
                || path.startsWith("/favicon")
                || path.startsWith("/logo")
                || path.startsWith("/manifest")
                || path.matches(".+\\.[a-zA-Z0-9]+$"); // 拡張子付きは除外
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // 除外条件に該当するものはそのまま通す
        if (isApiOrDoc(path) || isStaticAsset(path) || "/".equals(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        // GET 以外は API の可能性が高いので通す
        if (!"GET".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        // ここまで来たら SPA ルートとみなして index.html に内部フォワード
        request.getRequestDispatcher("/index.html").forward(request, response);
    }
}
