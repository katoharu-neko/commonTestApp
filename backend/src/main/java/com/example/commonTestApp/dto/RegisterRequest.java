package com.example.commonTestApp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    // ★ 追加：2=GENERAL / 3=EDUCATOR（UIから選択）
    private Integer roleId;
}
