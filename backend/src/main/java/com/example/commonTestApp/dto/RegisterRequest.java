package com.example.commonTestApp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String name;
    private String email;
    private String password;

    /** 任意：フロントから数値ロールIDを直接渡す場合（1=ADMIN, 2=GENERAL, 3=EDUCATOR） */
    private Integer roleId;

    /** 任意：フロントからロール名を渡す場合（"ROLE_GENERAL" / "ROLE_EDUCATOR" など） */
    private String roleName;
}
