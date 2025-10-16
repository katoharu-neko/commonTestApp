package com.example.commonTestApp.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "共通テスト過去問演習補助アプリ API",
        version = "1.0.0",
        description = "Spring Boot + React 用 REST API ドキュメント"
    )
)
public class OpenApiConfig { }
