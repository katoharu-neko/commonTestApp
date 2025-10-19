package com.example.commonTestApp.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.commonTestApp.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    // これまで通りの検索
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * ロールを一緒に取得して LazyInitializationException を回避したい場合は
     * 1) fetch join を使う @Query
     *    → メソッド名は自由（派生クエリではないので "WithRole" などを付けてもOK）
     */
    @Query("select u from User u left join fetch u.role where u.email = :email")
    Optional<User> findByEmailFetchRole(@Param("email") String email);

    /**
     * 2) または EntityGraph を既存の findByEmail に付与する別名メソッド
     *    ※ こちらを使うならサービス／フィルタ側もこのメソッドを呼ぶ
     */
    @EntityGraph(attributePaths = "role")
    Optional<User> findOneByEmail(String email);
}
