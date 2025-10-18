package com.example.commonTestApp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Role {
    @Id
    private Integer id; // 1,2,3 など

    @Column(nullable = false, unique = true, length = 50)
    private String name; // "ROLE_ADMIN" / "ROLE_GENERAL" / "ROLE_EDUCATOR"
}
