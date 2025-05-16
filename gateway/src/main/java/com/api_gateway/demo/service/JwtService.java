//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.api_gateway.demo.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private SecretKey secretKey;

    public JwtService() {
    }

    @PostConstruct
    public void init() {
        String secret = "mySuperSecretKeyThatIsLongEnough123456";
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public Claims validateToken(String token) {
        return (Claims)Jwts.parserBuilder().setSigningKey(this.secretKey).build().parseClaimsJws(token).getBody();
    }
}
