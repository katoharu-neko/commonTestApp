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

    // JwtAuthenticationFilter を Bean 登録（DIで JwtUtil / UserRepository を注入）
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        return new JwtAuthenticationFilter(jwtUtil, userRepository);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtAuthenticationFilter jwtFilter) throws Exception {
        http
            .httpBasic(h -> h.disable())
            .formLogin(f -> f.disable())
            .csrf(c -> c.disable())
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                // Swagger / Auth / Error は常に許可
                .requestMatchers(
                    "/api/auth/**",
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/error"
                ).permitAll()
                // SPA の静的ファイルとトップ
                .requestMatchers(
                    "/", "/index.html",
                    "/static/**", "/assets/**",
                    "/*.js", "/*.css", "/*.map",
                    "/favicon.ico", "/logo*"
                ).permitAll()
                // それ以外は認証必須（API など）
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            // 任意：application.yml の app.frontendBaseUrl を拾う（無ければ*herokuapp.comも許可）
            @Value("${app.frontendBaseUrl:http://localhost:3000}") String frontendBaseUrl) {

        CorsConfiguration config = new CorsConfiguration();

        // 開発: localhost (3000, 8080 など)
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "https://*.herokuapp.com",  // 本番: Heroku ドメインをパターン許可
            frontendBaseUrl             // 明示指定されたURLも許可
        ));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
