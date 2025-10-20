package com.example.commonTestApp.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.commonTestApp.repository.UserRepository;

@Configuration
public class SecurityConfig {

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        return new JwtAuthenticationFilter(jwtUtil, userRepository);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
        http
            .httpBasic(h -> h.disable())
            .formLogin(f -> f.disable())
            .csrf(c -> c.disable())
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                // 認証不要API（ログイン・登録など）
                .requestMatchers("/api/auth/**").permitAll()

                // Swagger / OpenAPI
                .requestMatchers(
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
                ).permitAll()

                // エラーページ
                .requestMatchers("/error").permitAll()

                // SPAの静的ファイル（Reactビルド成果物）
                .requestMatchers(
                    "/",
                    "/index.html",
                    "/manifest.json",
                    "/asset-manifest.json",
                    "/favicon.ico",
                    "/robots.txt",
                    "/logo192.png",
                    "/logo512.png",
                    "/static/**",
                    "/assets/**",
                    // 直配信される可能性のある拡張子も一応許可
                    "/*.js", "/*.css", "/*.map"
                ).permitAll()

                // それ以外は認証必須
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CORSはローカル開発向け（本番は同一オリジンなので実質適用されない）
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.frontendBaseUrl:http://localhost:3000}") String frontendBaseUrl) {

        CorsConfiguration config = new CorsConfiguration();

        // ローカル(3000) & Heroku ドメイン & 任意指定を許可
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "https://*.herokuapp.com",
            frontendBaseUrl
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // API全体にCORS設定（必要に応じて "/api/**" に限定してもOK）
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
