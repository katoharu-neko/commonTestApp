// backend/src/main/resources/static/swagger-ui/swagger-initializer.js
window.onload = function () {
  window.ui = SwaggerUIBundle({
    url: "/v3/api-docs",           // ← 明示的に固定
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset,
    ],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl],
    layout: "StandaloneLayout",
    displayRequestDuration: true,
    persistAuthorization: true,
    tryItOutEnabled: true,
    validatorUrl: null,
  });
};
