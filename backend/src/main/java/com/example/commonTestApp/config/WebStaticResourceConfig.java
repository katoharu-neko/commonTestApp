package com.example.commonTestApp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Swagger UI の静的ファイルを確実に配信するためのハンドラ設定。
 * ※ @EnableWebMvc は付けないこと（付けるとデフォルトの静的配信が消えます）
 */
@Configuration
public class WebStaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // springdoc 2.x の UI 配置先（jar 内）
        registry
            .addResourceHandler("/swagger-ui/**")
            .addResourceLocations("classpath:/META-INF/resources/swagger-ui/");

        // 念のため webjars も有効化（他の静的依存がある場合に備えて）
        registry
            .addResourceHandler("/webjars/**")
            .addResourceLocations("classpath:/META-INF/resources/webjars/");

        // 既定の静的ファイル (static, public, resources, META-INF/resources) も残す
        // 明示しなくても良いが、他の設定に潰されるケースを避けるため保険
        registry
            .addResourceHandler("/**")
            .addResourceLocations(
                "classpath:/META-INF/resources/",
                "classpath:/resources/",
                "classpath:/static/",
                "classpath:/public/"
            );
    }
}
