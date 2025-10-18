package com.example.commonTestApp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * メール検証の結果を表すレスポンス。
 * code:
 *  - VERIFIED: 今回の呼び出しで検証完了
 *  - ALREADY_VERIFIED: すでに検証済み（トークンが無効/消費済み）
 *  - TOKEN_EXPIRED: 有効期限切れ
 *  - TOKEN_INVALID: トークン不正（フォーマット不正など）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyResponse {
    private String code;
    private String message;
}
